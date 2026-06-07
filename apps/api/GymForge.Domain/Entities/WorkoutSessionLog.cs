namespace GymForge.Domain.Entities
{
    public class WorkoutSessionLog : BaseEntity
    {
        public Guid MemberId { get; set; }
        public DateTime Date { get; set; }
        public string DayName { get; set; } = string.Empty;
        public int ExercisesCompleted { get; set; }
        public int TotalSets { get; set; }
        public string Status { get; set; } = "Completed"; // Completed, Planned, RestDay
        public string? Notes { get; set; }
        
        public GymMember Member { get; set; } = null!;
        public ICollection<LoggedExercise> LoggedExercises { get; set; } = [];
    }
}
