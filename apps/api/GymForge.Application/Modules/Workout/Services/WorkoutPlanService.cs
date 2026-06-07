using AutoMapper;
using GymForge.Application.Modules.Workout.Interface;
using GymForge.Contracts.WorkoutPlan;
using GymForge.Domain.Entities;
using GymForge.Domain.Interface;

namespace GymForge.Application.Modules.Workout.Services
{
    public class WorkoutPlanService : IWorkoutPlanService
    {
        private readonly IWorkoutPlanRepository _workoutPlanRepository;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;

        public WorkoutPlanService(IWorkoutPlanRepository workoutPlanRepository,IMapper mapper,IUnitOfWork unitOfWork)
        {
            _workoutPlanRepository = workoutPlanRepository;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<WorkoutPlanDto>> GetPlansByGymIdAsync(Guid gymId, string? type = null)
        {
            IEnumerable<WorkoutPlan> plans = await _workoutPlanRepository.GetPlansByGymIdAsync(gymId, type);
            return _mapper.Map<IEnumerable<WorkoutPlanDto>>(plans);
        }

        public async Task<WorkoutPlanDto?> GetPlanByIdAsync(Guid id)
        {
            WorkoutPlan? plan = await _workoutPlanRepository.GetPlanByIdAsync(id);
            return plan == null ? null : _mapper.Map<WorkoutPlanDto>(plan);
        }

        public async Task<WorkoutPlanDto> CreatePlanAsync(CreateWorkoutPlanRequest request, Guid gymId, Guid createdById)
        {
            WorkoutPlan plan = _mapper.Map<WorkoutPlan>(request);
            plan.GymId = gymId;
            plan.CreatedBy = createdById;

            plan.DaysCount = plan.Days.Count;
            plan.ExercisesCount = plan.Days.Sum(d => d.IsRestDay ? 0 : d.Exercises.Count);

            WorkoutPlan created = await _workoutPlanRepository.CreatePlanAsync(plan);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<WorkoutPlanDto>(created);
        }

        public async Task<WorkoutPlanDto> UpdatePlanAsync(UpdateWorkoutPlanRequest request, Guid gymId, Guid modifiedById)
        {
            WorkoutPlan? existingPlan = await _workoutPlanRepository.GetPlanByIdAsync(request.Id);
            
            if (existingPlan == null)
            {
                throw new KeyNotFoundException("Workout Plan not found.");
            }

            existingPlan.Name = request.Name;
            existingPlan.Description = request.Description;
            existingPlan.Level = request.Level;
            existingPlan.Goal = request.Goal;
            existingPlan.Type = request.Type;
            existingPlan.ModifiedBy = modifiedById;
            existingPlan.ModifiedOn = DateTime.UtcNow;

            existingPlan.Days.Clear();

            foreach (CreateWorkoutPlanDayDto dayDto in request.Days)
            {
                WorkoutPlanDay day = _mapper.Map<WorkoutPlanDay>(dayDto);
                existingPlan.Days.Add(day);
            }

            existingPlan.DaysCount = existingPlan.Days.Count;
            existingPlan.ExercisesCount = existingPlan.Days.Sum(d => d.IsRestDay ? 0 : d.Exercises.Count);

            await _workoutPlanRepository.UpdatePlanAsync(existingPlan);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<WorkoutPlanDto>(existingPlan);
        }

        public async Task<bool> DeletePlanAsync(Guid id)
        {
            bool success = await _workoutPlanRepository.DeletePlanAsync(id);
            if (success)
            {
                await _unitOfWork.SaveChangesAsync();
            }
            return success;
        }
    }
}
