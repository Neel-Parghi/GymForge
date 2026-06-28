namespace GymForge.Contracts.DietTracking;

public class FoodNutritionDto
{
    public string Name { get; set; } = string.Empty;
    public double Calories { get; set; }
    public double Protein { get; set; }
    public double Carbs { get; set; }
    public double Fats { get; set; }
}
