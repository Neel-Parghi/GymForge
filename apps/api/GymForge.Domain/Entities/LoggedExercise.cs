namespace GymForge.Domain.Entities
{
    public class LoggedExercise : BaseEntity
    {
        public Guid WorkoutSessionLogId { get; set; }
        public string Name { get; set; } = string.Empty;
        
        public WorkoutSessionLog WorkoutSessionLog { get; set; } = null!;
        public ICollection<LoggedSet> LoggedSets { get; set; } = new List<LoggedSet>();
    }
}
