using GymForge.Contracts.DietTracking;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace GymForge.Application.Modules.Diet.Interfaces
{
    public interface IDietTrackingService
    {
        Task<DietLogDto> GetDietLogAsync(Guid memberId, DateTime logDate);
        Task<DietLogDto> AddMealEntryAsync(Guid memberId, AddMealEntryRequestDto request);
        Task<DietLogDto> RemoveMealEntryAsync(Guid memberId, Guid mealEntryId);
        Task<List<DietLogSummaryDto>> GetWeeklySummaryAsync(Guid memberId, DateTime endDate);
    }
}
