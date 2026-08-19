using GymForge.Domain.Entities;
using GymForge.Domain.Interface;
using GymForge.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GymForge.Infrastructure.Repositories
{
    public class WorkoutRepository : IWorkoutRepository
    {
        private readonly AppDbContext _dbContext;

        public WorkoutRepository(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<List<string>?> GetCategories()
        {
            List<string> categories = await _dbContext.Exercises
                .Select(e => e.Category)
                .Distinct()
                .ToListAsync();

            if (categories == null || categories.Count == 0)
                return null;

            return [.. categories.OrderBy(c => c)];
        }

        public async Task<List<Exercise>> GetExercises(string? category, string? equipment, string? search)
        {
            IQueryable<Exercise> query = _dbContext.Exercises.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(category))
            {
                query = query.Where(e => e.Category.ToLower() == category.ToLower());
            }

            if (!string.IsNullOrWhiteSpace(equipment))
            {
                query = query.Where(e => e.Equipment.ToLower() == equipment.ToLower());
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(e => e.Name.ToLower().Contains(search.ToLower()));
            }

            return await query.OrderBy(e => e.Name).ToListAsync();
        }

        public async Task<List<Exercise>> GetExercisesByCategory(string category)
        {
            return await _dbContext.Exercises
                .AsNoTracking()
                .Where(e => e.Category.ToLower() == category.ToLower())
                .OrderBy(e => e.Name)
                .ToListAsync();
        }

        public async Task<Exercise?> GetExerciseBySlug(string slug)
        {
            Exercise? exercise = await _dbContext.Exercises
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.Slug.ToLower() == slug.ToLower());

            return exercise;
        }

        public async Task<Dictionary<string, string>> GetCategoriesForNamesAsync(IEnumerable<string> names)
        {
            List<string> lowerNames = [.. names.Select(n => n.ToLower())];

            List<Exercise> matches = await _dbContext.Exercises
                .AsNoTracking()
                .Where(e => lowerNames.Contains(e.Name.ToLower()))
                .ToListAsync();

            return matches
                .GroupBy(e => e.Name.ToLower())
                .ToDictionary(g => g.Key, g => g.First().Category);
        }
    }
}
