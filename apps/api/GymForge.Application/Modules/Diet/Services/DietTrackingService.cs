using GymForge.Application.Modules.Diet.Interfaces;
using GymForge.Contracts.DietTracking;
using GymForge.Domain.Entities;
using GymForge.Domain.Interface;

namespace GymForge.Application.Modules.Diet.Services
{
    public class DietTrackingService : IDietTrackingService
    {
        private readonly IDietTrackingRepository _repository;
        private readonly IMemberDietRepository _memberDietRepository;

        public DietTrackingService(IDietTrackingRepository repository, IMemberDietRepository memberDietRepository)
        {
            _repository = repository;
            _memberDietRepository = memberDietRepository;
        }

        public async Task<DietLogDto> GetDietLogAsync(Guid memberId, DateTime logDate)
        {
            var date = DateTime.SpecifyKind(logDate.Date, DateTimeKind.Utc);
            var activeAssignment = await _memberDietRepository.GetActiveDietAssignmentAsync(memberId);
            var log = await _repository.GetDietLogWithEntriesAsync(memberId, date);

            if (log == null)
            {
                log = await CreateEmptyLogAsync(memberId, date, activeAssignment);
            }

            return MapToDto(log, activeAssignment);
        }

        public async Task<DietLogDto> AddMealEntryAsync(Guid memberId, AddMealEntryRequestDto request)
        {
            var date = DateTime.SpecifyKind(request.LogDate.Date, DateTimeKind.Utc);
            var activeAssignment = await _memberDietRepository.GetActiveDietAssignmentAsync(memberId);
            var log = await _repository.GetDietLogWithEntriesAsync(memberId, date);

            if (log == null)
            {
                log = await CreateEmptyLogAsync(memberId, date, activeAssignment);
            }

            var entry = new MealLogEntry
            {
                DietLogId = log.Id,
                MealType = request.MealType,
                FoodName = request.FoodName,
                Calories = request.Calories,
                Protein = request.Protein,
                Carbs = request.Carbs,
                Fats = request.Fats,
                SourceDietPlanMealId = request.SourceDietPlanMealId
            };

            log.MealEntries.Add(entry);
            UpdateLogTotals(log);

            await _repository.SaveChangesAsync();
            
            // Reload entries from DB so the returned DTO has fully populated IDs
            await _repository.LoadMealEntriesAsync(log);
            
            return MapToDto(log, activeAssignment);
        }

        public async Task<DietLogDto> RemoveMealEntryAsync(Guid memberId, Guid mealEntryId)
        {
            var entry = await _repository.GetMealEntryWithLogAsync(mealEntryId);

            if (entry == null || entry.DietLog?.MemberId != memberId)
            {
                throw new Exception("Meal entry not found or unauthorized.");
            }

            var log = entry.DietLog!;
            _repository.RemoveMealEntry(entry);
            
            // Force load all other entries to update totals accurately
            await _repository.LoadMealEntriesAsync(log);
            
            UpdateLogTotals(log);
            await _repository.SaveChangesAsync();

            var activeAssignment = await _memberDietRepository.GetActiveDietAssignmentAsync(memberId);
            return MapToDto(log, activeAssignment);
        }

        public async Task<List<DietLogSummaryDto>> GetWeeklySummaryAsync(Guid memberId, DateTime endDate)
        {
            var startDate = endDate.Date.AddDays(-6);
            
            var logs = await _repository.GetDietLogsByDateRangeAsync(memberId, startDate, endDate);

            var summary = new List<DietLogSummaryDto>();

            for (int i = 0; i <= 6; i++)
            {
                var targetDate = startDate.AddDays(i);
                var log = logs.FirstOrDefault(l => l.LogDate.Date == targetDate.Date);

                if (log != null)
                {
                    summary.Add(new DietLogSummaryDto
                    {
                        LogDate = log.LogDate,
                        TargetCalories = log.TargetCalories,
                        TotalCalories = log.TotalCalories,
                        TargetProtein = log.TargetProtein,
                        TotalProtein = log.TotalProtein,
                        TargetCarbs = log.TargetCarbs,
                        TotalCarbs = log.TotalCarbs,
                        TargetFats = log.TargetFats,
                        TotalFats = log.TotalFats
                    });
                }
                else
                {
                    summary.Add(new DietLogSummaryDto
                    {
                        LogDate = targetDate,
                        TargetCalories = 0,
                        TotalCalories = 0
                    });
                }
            }

            return summary;
        }

        private async Task<DietLog> CreateEmptyLogAsync(Guid memberId, DateTime date, MemberDietAssignment? activeAssignment)
        {
            var log = new DietLog
            {
                MemberId = memberId,
                LogDate = DateTime.SpecifyKind(date, DateTimeKind.Utc),
                TotalCalories = 0,
                TotalProtein = 0,
                TotalCarbs = 0,
                TotalFats = 0
            };

            // Sync targets from active diet plan if any

            if (activeAssignment?.DietPlan != null)
            {
                log.TargetCalories = activeAssignment.DietPlan.Calories;
                log.TargetProtein = activeAssignment.DietPlan.Protein;
                log.TargetCarbs = activeAssignment.DietPlan.Carbs;
                log.TargetFats = activeAssignment.DietPlan.Fats;
            }

            _repository.AddDietLog(log);
            await _repository.SaveChangesAsync();
            
            return log;
        }

        private void UpdateLogTotals(DietLog log)
        {
            log.TotalCalories = log.MealEntries.Sum(e => e.Calories);
            log.TotalProtein = log.MealEntries.Sum(e => e.Protein);
            log.TotalCarbs = log.MealEntries.Sum(e => e.Carbs);
            log.TotalFats = log.MealEntries.Sum(e => e.Fats);
        }

        private DietLogDto MapToDto(DietLog log, MemberDietAssignment? activeAssignment)
        {
            var dto = new DietLogDto
            {
                Id = log.Id,
                MemberId = log.MemberId,
                LogDate = log.LogDate,
                TargetCalories = log.TargetCalories,
                TargetProtein = log.TargetProtein,
                TargetCarbs = log.TargetCarbs,
                TargetFats = log.TargetFats,
                TotalCalories = log.TotalCalories,
                TotalProtein = log.TotalProtein,
                TotalCarbs = log.TotalCarbs,
                TotalFats = log.TotalFats,
                MealEntries = log.MealEntries.Select(e => new MealLogEntryDto
                {
                    Id = e.Id,
                    MealType = e.MealType,
                    FoodName = e.FoodName,
                    Calories = e.Calories,
                    Protein = e.Protein,
                    Carbs = e.Carbs,
                    Fats = e.Fats,
                    SourceDietPlanMealId = e.SourceDietPlanMealId
                }).ToList()
            };

            if (activeAssignment?.DietPlan?.Meals != null)
            {
                dto.AssignedMeals = activeAssignment.DietPlan.Meals.Select(m => new AssignedMealDto
                {
                    Id = m.Id,
                    Name = m.Name,
                    Time = m.Time,
                    Calories = m.Calories,
                    Protein = m.Protein,
                    Carbs = 0, // Since DietPlanMeal only tracks calories & protein for now
                    Fats = 0,
                    Items = m.Items
                }).ToList();
            }

            return dto;
        }
    }
}
