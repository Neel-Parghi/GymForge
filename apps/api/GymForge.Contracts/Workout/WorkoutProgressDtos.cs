namespace GymForge.Contracts.Workout
{
    public class LoggedExerciseNameDto
    {
        public string Name { get; set; } = string.Empty;
        public string? MuscleGroup { get; set; }
        public DateTime LastLoggedDate { get; set; }
    }

    public class ExerciseProgressPointDto
    {
        public Guid SessionLogId { get; set; }
        public DateTime Date { get; set; }
        public double TopWeight { get; set; }
        public int TopWeightReps { get; set; }
        public int TotalSets { get; set; }
    }

    public class ExerciseProgressDto
    {
        public string ExerciseName { get; set; } = string.Empty;
        public string? MuscleGroup { get; set; }
        public double PersonalBest { get; set; }
        public int TotalSessions { get; set; }
        public DateTime? LastLoggedDate { get; set; }
        public double? EstimatedOneRepMax { get; set; }
        public List<ExerciseProgressPointDto> Points { get; set; } = [];
    }
}
