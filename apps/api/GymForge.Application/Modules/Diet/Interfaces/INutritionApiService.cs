using System.Threading.Tasks;
using GymForge.Contracts.DietTracking;

namespace GymForge.Application.Modules.Diet.Interfaces;

public interface INutritionApiService
{
    Task<FoodNutritionDto?> GetNutritionForFoodAsync(string query);
}
