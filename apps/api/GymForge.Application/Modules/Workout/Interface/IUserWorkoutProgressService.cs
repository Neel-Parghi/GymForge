using GymForge.Contracts.Workout;

namespace GymForge.Application.Modules.Workout.Interface
{
    public interface IUserWorkoutProgressService
    {
        Task<IEnumerable<LoggedExerciseNameDto>> GetLoggedExerciseNamesAsync(Guid userId);

        Task<ExerciseProgressDto?> GetExerciseProgressAsync(Guid userId, string exerciseName);
    }
}
