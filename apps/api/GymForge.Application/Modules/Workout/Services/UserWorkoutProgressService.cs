using GymForge.Application.Modules.Workout.Interface;
using GymForge.Contracts.Workout;
using GymForge.Domain.Entities;
using GymForge.Domain.Interface;

namespace GymForge.Application.Modules.Workout.Services
{
    public class UserWorkoutProgressService : IUserWorkoutProgressService
    {
        private readonly IMemberWorkoutRepository _memberWorkoutRepository;
        private readonly IWorkoutRepository _workoutRepository;

        public UserWorkoutProgressService(IMemberWorkoutRepository memberWorkoutRepository, IWorkoutRepository workoutRepository)
        {
            _memberWorkoutRepository = memberWorkoutRepository;
            _workoutRepository = workoutRepository;
        }

        public async Task<IEnumerable<LoggedExerciseNameDto>> GetLoggedExerciseNamesAsync(Guid userId)
        {
            IEnumerable<WorkoutSessionLog> logs = await _memberWorkoutRepository.GetWorkoutLogsAsync(userId);

            List<(DateTime Date, LoggedExercise Exercise)> trackable = [.. logs
                .SelectMany(l => l.LoggedExercises.Select(e => (l.Date, Exercise: e)))
                .Where(x => !x.Exercise.Skipped && !x.Exercise.IsCardio && x.Exercise.LoggedSets.Any(s => s.Completed))];

            List<IGrouping<string, (DateTime Date, LoggedExercise Exercise)>> grouped = [.. trackable
                .GroupBy(x => x.Exercise.Name.Trim().ToLower())];

            Dictionary<string, string> categoryMap = await _workoutRepository.GetCategoriesForNamesAsync(
                grouped.Select(g => g.Key));

            List<LoggedExerciseNameDto> result = [.. grouped
                .Select(g =>
                {
                    (DateTime Date, LoggedExercise Exercise) latest = g.OrderByDescending(x => x.Date).First();
                    categoryMap.TryGetValue(g.Key, out string? category);

                    return new LoggedExerciseNameDto
                    {
                        Name = latest.Exercise.Name.Trim(),
                        MuscleGroup = category,
                        LastLoggedDate = latest.Date
                    };
                })
                .OrderByDescending(x => x.LastLoggedDate)];

            return result;
        }

        public async Task<ExerciseProgressDto?> GetExerciseProgressAsync(Guid userId, string exerciseName)
        {
            if (string.IsNullOrWhiteSpace(exerciseName))
                return null;

            IEnumerable<WorkoutSessionLog> logs = await _memberWorkoutRepository.GetWorkoutLogsAsync(userId);
            string target = exerciseName.Trim().ToLower();

            List<ExerciseProgressPointDto> points = [.. logs
                .SelectMany(l => l.LoggedExercises
                    .Where(e => !e.Skipped && e.Name.Trim().ToLower() == target && e.LoggedSets.Any(s => s.Completed))
                    .Select(e => new { l.Id, l.Date, Exercise = e }))
                .Select(x =>
                {
                    List<LoggedSet> completedSets = [.. x.Exercise.LoggedSets.Where(s => s.Completed)];
                    LoggedSet topSet = completedSets.OrderByDescending(s => s.Weight).ThenByDescending(s => s.Reps).First();

                    return new ExerciseProgressPointDto
                    {
                        SessionLogId = x.Id,
                        Date = x.Date,
                        TopWeight = topSet.Weight,
                        TopWeightReps = topSet.Reps,
                        TotalSets = completedSets.Count
                    };
                })
                .OrderBy(p => p.Date)];

            if (points.Count == 0)
                return null;

            ExerciseProgressPointDto mostRecent = points[^1];
            double? oneRepMax = mostRecent.TopWeightReps > 0
                ? Math.Round(mostRecent.TopWeight * (1 + mostRecent.TopWeightReps / 30.0), 1)
                : null;

            Dictionary<string, string> categoryMap = await _workoutRepository.GetCategoriesForNamesAsync([target]);
            categoryMap.TryGetValue(target, out string? category);

            return new ExerciseProgressDto
            {
                ExerciseName = exerciseName.Trim(),
                MuscleGroup = category,
                PersonalBest = points.Max(p => p.TopWeight),
                TotalSessions = points.Count,
                LastLoggedDate = points[^1].Date,
                EstimatedOneRepMax = oneRepMax,
                Points = points
            };
        }
    }
}
