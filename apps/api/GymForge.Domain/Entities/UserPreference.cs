namespace GymForge.Domain.Entities
{
    public class UserPreference : BaseEntity
    {
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        public string? PrimaryGoal { get; set; }
        public string? ExperienceLevel { get; set; } // Beginner, Intermediate, Advanced
        public double? TargetWeight { get; set; }
        public int? TargetCalories { get; set; }
        public int? TargetProtein { get; set; }
        public int? TargetCarbs { get; set; }
        public int? TargetFats { get; set; }
        public int? TargetTrainingTime { get; set; }
    }
}
