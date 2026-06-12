namespace GymForge.Domain.Entities
{
    public class DietPlan : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Protein { get; set; }
        public decimal Carbs { get; set; }
        public decimal Fats { get; set; }
        public int Calories { get; set; }
        public string Goal { get; set; } = "Maintenance";
        public Guid GymId { get; set; }
        public bool IsCustom { get; set; } = false; // Whether it is custom made for a member
        public bool IsTemplate { get; set; } = true; // Whether it is a global template or custom/private
        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedAt { get; set; }

        public ICollection<DietPlanMeal> Meals { get; set; } = [];
    }
}
