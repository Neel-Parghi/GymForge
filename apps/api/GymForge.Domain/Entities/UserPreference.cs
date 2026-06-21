namespace GymForge.Domain.Entities
{
    public class UserPreference : BaseEntity
    {
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        public string? PrimaryGoal { get; set; }
        public double? TargetWeight { get; set; }
    }
}
