using System.Threading.Tasks;
using GymForge.Contracts.DietTracking;

namespace GymForge.Application.Modules.Diet.Interfaces;

public interface IFoodSearchProvider
{
    Task<FoodNutritionDto?> SearchAsync(string query);
}
