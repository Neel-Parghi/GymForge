using System.Threading.Tasks;
using GymForge.Application.Modules.Diet.Interfaces;
using GymForge.Contracts.DietTracking;
using Microsoft.Extensions.Logging;

namespace GymForge.Infrastructure.Services;

/// <summary>
/// Tries each configured food-search provider in order and returns the first match.
/// USDA FoodData Central goes first (free, effectively no request cap); CalorieNinjas
/// is the fallback for foods USDA doesn't have (e.g. restaurant/branded items).
/// </summary>
public class NutritionApiService : INutritionApiService
{
    private readonly UsdaFoodDataProvider _usdaProvider;
    private readonly CalorieNinjasFoodSearchProvider _calorieNinjasProvider;
    private readonly ILogger<NutritionApiService> _logger;

    public NutritionApiService(
        UsdaFoodDataProvider usdaProvider,
        CalorieNinjasFoodSearchProvider calorieNinjasProvider,
        ILogger<NutritionApiService> logger)
    {
        _usdaProvider = usdaProvider;
        _calorieNinjasProvider = calorieNinjasProvider;
        _logger = logger;
    }

    public async Task<FoodNutritionDto?> GetNutritionForFoodAsync(string query)
    {
        var result = await _usdaProvider.SearchAsync(query);
        if (result != null)
        {
            return result;
        }

        _logger.LogInformation("USDA FoodData Central had no match for '{Query}', falling back to CalorieNinjas.", query);
        return await _calorieNinjasProvider.SearchAsync(query);
    }
}
