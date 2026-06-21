namespace GymForge.Contracts.Users
{
    public class CompleteUserOnboardingDto
    {
        public string PrimaryGoal { get; set; } = string.Empty;
        public decimal Height { get; set; }
        public decimal Weight { get; set; }
        public decimal? TargetWeight { get; set; }
        public DateTime DOB { get; set; }
        public string Gender { get; set; } = string.Empty;
    }
}
