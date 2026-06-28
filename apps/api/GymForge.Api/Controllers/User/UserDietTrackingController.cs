using GymForge.Application.Modules.Diet.Interfaces;
using GymForge.Contracts.DietTracking;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymForge.Api.Controllers.User
{
    [ApiController]
    [Route("api/user/diet-tracking")]
    [Authorize(Roles = "User")]
    public class UserDietTrackingController : BaseApiController
    {
        private readonly IDietTrackingService _dietTrackingService;
        private readonly INutritionApiService _nutritionApiService;

        public UserDietTrackingController(IDietTrackingService dietTrackingService, INutritionApiService nutritionApiService)
        {
            _dietTrackingService = dietTrackingService;
            _nutritionApiService = nutritionApiService;
        }

        private Guid GetMemberId()
        {
            return UserId;
        }

        [HttpGet("{date}")]
        public async Task<IActionResult> GetDietLog(DateTime date)
        {
            var log = await _dietTrackingService.GetDietLogAsync(GetMemberId(), date);
            return Ok(log);
        }

        [HttpPost("meals")]
        public async Task<IActionResult> AddMealEntry([FromBody] AddMealEntryRequestDto request)
        {
            var log = await _dietTrackingService.AddMealEntryAsync(GetMemberId(), request);
            return Ok(log);
        }

        [HttpDelete("meals/{mealEntryId}")]
        public async Task<IActionResult> RemoveMealEntry(Guid mealEntryId)
        {
            var log = await _dietTrackingService.RemoveMealEntryAsync(GetMemberId(), mealEntryId);
            return Ok(log);
        }

        [HttpGet("summary/{endDate}")]
        public async Task<IActionResult> GetWeeklySummary(DateTime endDate)
        {
            var summary = await _dietTrackingService.GetWeeklySummaryAsync(GetMemberId(), endDate);
            return Ok(summary);
        }

        [HttpGet("search-food")]
        public async Task<IActionResult> SearchFood([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest("Query cannot be empty.");

            var result = await _nutritionApiService.GetNutritionForFoodAsync(query);
            if (result == null)
                return NotFound("No nutrition data found for the given query.");

            return Ok(result);
        }
    }
}
