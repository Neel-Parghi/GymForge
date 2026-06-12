using AutoMapper;
using GymForge.Application.Modules.Workout.Interface;
using GymForge.Contracts.WorkoutPlan;
using GymForge.Domain.Entities;
using GymForge.Domain.Interface;

namespace GymForge.Application.Modules.Workout.Services
{
    public class MemberWorkoutService : IMemberWorkoutService
    {
        private readonly IMemberWorkoutRepository _memberWorkoutRepository;
        private readonly IWorkoutPlanRepository _workoutPlanRepository;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;

        public MemberWorkoutService(
            IMemberWorkoutRepository memberWorkoutRepository,
            IWorkoutPlanRepository workoutPlanRepository,
            IMapper mapper, 
            IUnitOfWork unitOfWork)
        {
            _memberWorkoutRepository = memberWorkoutRepository;
            _workoutPlanRepository = workoutPlanRepository;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
        }

        public async Task<WorkoutPlanDto?> GetActivePlanForMemberAsync(Guid memberId)
        {
            MemberPlanAssignment? assignment = await _memberWorkoutRepository.GetActivePlanAssignmentAsync(memberId);
            if (assignment == null) return null;

            WorkoutPlan? plan = await _workoutPlanRepository.GetPlanByIdAsync(assignment.WorkoutPlanId);
            if (plan == null) return null;

            WorkoutPlanDto planDto = _mapper.Map<WorkoutPlanDto>(plan);

            if (assignment.CustomScheduleDays != null && assignment.CustomScheduleDays.Any())
            {
                List<WorkoutPlanDayDto> finalDays = [];
                
                HashSet<Guid> mappedTemplateDayIds = assignment.CustomScheduleDays
                    .Where(cs => !cs.IsRestDay && cs.WorkoutPlanDayId.HasValue)
                    .Select(cs => cs.WorkoutPlanDayId!.Value)
                    .ToHashSet();

                foreach (MemberWorkoutScheduleDay customDay in assignment.CustomScheduleDays)
                {
                    if (customDay.IsRestDay)
                    {
                        finalDays.Add(new WorkoutPlanDayDto
                        {
                            Id = Guid.NewGuid(),
                            WorkoutPlanId = planDto.Id,
                            DayName = customDay.DayOfWeek,
                            IsRestDay = true,
                            Category = "Rest Day",
                            Exercises = []
                        });
                    }
                    else if (customDay.WorkoutPlanDayId.HasValue)
                    {
                        WorkoutPlanDay? templateDay = plan.Days.FirstOrDefault(d => d.Id == customDay.WorkoutPlanDayId.Value);
                        if (templateDay != null)
                        {
                            WorkoutPlanDayDto mappedDay = _mapper.Map<WorkoutPlanDayDto>(templateDay);
                            mappedDay.DayName = customDay.DayOfWeek;
                            finalDays.Add(mappedDay);
                        }
                    }
                }

                foreach (WorkoutPlanDay templateDay in plan.Days)
                {
                    if (!mappedTemplateDayIds.Contains(templateDay.Id))
                    {
                        bool weekdayIsCustomized = assignment.CustomScheduleDays.Any(cs => 
                            string.Equals(cs.DayOfWeek, templateDay.DayName, StringComparison.OrdinalIgnoreCase));

                        if (!weekdayIsCustomized)
                        {
                            finalDays.Add(_mapper.Map<WorkoutPlanDayDto>(templateDay));
                        }
                    }
                }

                planDto.Days = finalDays;
            }

            return planDto;
        }

        public async Task<bool> AssignPlanToMemberAsync(Guid memberId, Guid planId)
        {
            MemberPlanAssignment? activeAssignment = await _memberWorkoutRepository.GetActivePlanAssignmentAsync(memberId);
            if (activeAssignment != null)
            {
                activeAssignment.IsActive = false;
            }

            IEnumerable<WorkoutSessionLog> logs = await _memberWorkoutRepository.GetWorkoutLogsAsync(memberId);
            DateTime today = DateTime.UtcNow.Date;
            List<WorkoutSessionLog> futurePlannedLogs = [.. logs.Where(l => (l.Status == "Planned" || l.Status == "RestDay") && l.Date.Date >= today)];

            if (futurePlannedLogs.Any())
            {
                await _memberWorkoutRepository.RemoveWorkoutSessionLogsAsync(futurePlannedLogs);
            }

            MemberPlanAssignment newAssignment = new()
            {
                MemberId = memberId,
                WorkoutPlanId = planId,
                AssignedAt = DateTime.UtcNow,
                IsActive = true
            };

            await _memberWorkoutRepository.AddPlanAssignmentAsync(newAssignment);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<WorkoutSessionLogDto>> GetWorkoutLogsForMemberAsync(Guid memberId)
        {
            IEnumerable<WorkoutSessionLog> logs = await _memberWorkoutRepository.GetWorkoutLogsAsync(memberId);
            return _mapper.Map<IEnumerable<WorkoutSessionLogDto>>(logs);
        }

        public async Task<WorkoutSessionLogDto> LogWorkoutSessionAsync(Guid memberId, LogWorkoutSessionRequest request)
        {
            IEnumerable<WorkoutSessionLog> existingLogs = await _memberWorkoutRepository.GetLogsByDateAsync(memberId, request.Date);
            if (existingLogs.Any())
            {
                await _memberWorkoutRepository.RemoveWorkoutSessionLogsAsync(existingLogs);
            }

            WorkoutSessionLog log = new()
            {
                MemberId = memberId,
                Date = request.Date,
                DayName = request.DayName,
                Status = request.Status,
                Notes = request.Notes
            };

            int exercisesCompleted = 0;
            int totalSets = 0;

            foreach (LogLoggedExerciseDto exDto in request.LoggedExercises)
            {
                LoggedExercise loggedExercise = new()
                {
                    Name = exDto.Name,
                    Skipped = exDto.Skipped,
                    SortOrder = exDto.SortOrder,
                    IsCardio = exDto.IsCardio
                };

                if (!exDto.Skipped)
                {
                    bool completedAnySet = false;

                    foreach (LogLoggedSetDto setDto in exDto.LoggedSets)
                    {
                        LoggedSet loggedSet = new()
                        {
                            SetNo = setDto.SetNo,
                            Weight = setDto.Weight,
                            Reps = setDto.Reps,
                            Completed = setDto.Completed
                        };

                        if (loggedSet.Completed)
                        {
                            completedAnySet = true;
                        }

                        loggedExercise.LoggedSets.Add(loggedSet);
                        totalSets++;
                    }

                    if (completedAnySet)
                    {
                        exercisesCompleted++;
                    }
                }

                log.LoggedExercises.Add(loggedExercise);
            }

            log.ExercisesCompleted = exercisesCompleted;
            log.TotalSets = totalSets;

            await _memberWorkoutRepository.AddWorkoutSessionLogAsync(log);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<WorkoutSessionLogDto>(log);
        }

        public async Task<bool> SaveRecurringOverrideAsync(Guid memberId, string dayOfWeek, Guid? workoutPlanDayId, bool isRestDay)
        {
            MemberPlanAssignment? assignment = await _memberWorkoutRepository.GetActivePlanAssignmentAsync(memberId);
            if (assignment == null) return false;

            MemberWorkoutScheduleDay scheduleDay = new()
            {
                MemberPlanAssignmentId = assignment.Id,
                DayOfWeek = dayOfWeek,
                WorkoutPlanDayId = workoutPlanDayId,
                IsRestDay = isRestDay,
                CreatedOn = DateTime.UtcNow,
                ModifiedOn = DateTime.UtcNow
            };

            await _memberWorkoutRepository.AddOrUpdateScheduleDayAsync(scheduleDay);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<MemberPlanAssignmentDto>> GetPlanAssignmentsForMemberAsync(Guid memberId)
        {
            IEnumerable<MemberPlanAssignment> assignments = await _memberWorkoutRepository.GetPlanAssignmentsAsync(memberId);
            List<MemberPlanAssignmentDto> dtos = new List<MemberPlanAssignmentDto>();

            foreach (MemberPlanAssignment assignment in assignments)
            {
                MemberPlanAssignmentDto dto = new()
                {
                    Id = assignment.Id,
                    MemberId = assignment.MemberId,
                    WorkoutPlanId = assignment.WorkoutPlanId,
                    AssignedAt = assignment.AssignedAt,
                    IsActive = assignment.IsActive
                };

                if (assignment.WorkoutPlan != null)
                {
                    WorkoutPlanDto planDto = _mapper.Map<WorkoutPlanDto>(assignment.WorkoutPlan);

                    if (assignment.CustomScheduleDays != null && assignment.CustomScheduleDays.Any())
                    {
                        List<WorkoutPlanDayDto> finalDays = [];
                        HashSet<Guid> mappedTemplateDayIds = assignment.CustomScheduleDays
                            .Where(cs => !cs.IsRestDay && cs.WorkoutPlanDayId.HasValue)
                            .Select(cs => cs.WorkoutPlanDayId!.Value)
                            .ToHashSet();

                        foreach (MemberWorkoutScheduleDay customDay in assignment.CustomScheduleDays)
                        {
                            if (customDay.IsRestDay)
                            {
                                finalDays.Add(new WorkoutPlanDayDto
                                {
                                    Id = Guid.NewGuid(),
                                    WorkoutPlanId = planDto.Id,
                                    DayName = customDay.DayOfWeek,
                                    IsRestDay = true,
                                    Category = "Rest Day",
                                    Exercises = []
                                });
                            }
                            else if (customDay.WorkoutPlanDayId.HasValue)
                            {
                                WorkoutPlanDay? templateDay = assignment.WorkoutPlan.Days.FirstOrDefault(d => d.Id == customDay.WorkoutPlanDayId.Value);
                                if (templateDay != null)
                                {
                                    WorkoutPlanDayDto mappedDay = _mapper.Map<WorkoutPlanDayDto>(templateDay);
                                    mappedDay.DayName = customDay.DayOfWeek;
                                    finalDays.Add(mappedDay);
                                }
                            }
                        }

                        foreach (WorkoutPlanDay templateDay in assignment.WorkoutPlan.Days)
                        {
                            if (!mappedTemplateDayIds.Contains(templateDay.Id))
                            {
                                bool weekdayIsCustomized = assignment.CustomScheduleDays.Any(cs => 
                                    string.Equals(cs.DayOfWeek, templateDay.DayName, StringComparison.OrdinalIgnoreCase));

                                if (!weekdayIsCustomized)
                                {
                                    finalDays.Add(_mapper.Map<WorkoutPlanDayDto>(templateDay));
                                }
                            }
                        }

                        planDto.Days = finalDays;
                    }

                    dto.WorkoutPlan = planDto;
                }

                dtos.Add(dto);
            }

            return dtos;
        }
    }
}
