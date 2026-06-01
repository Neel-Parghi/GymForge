using GymForge.Domain.Entities;

namespace GymForge.Domain.Interface
{
    public interface IWorkoutRepository
    {
        Task<List<string>?> GetCategories();

        Task<List<Exercise>> GetExercises(string? category, string? equipment, string? search);

        Task<List<Exercise>> GetExercisesByCategory(string category);

        Task<Exercise?> GetExerciseBySlug(string slug);
    }
}
