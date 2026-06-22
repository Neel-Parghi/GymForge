using GymForge.Domain.Entities;
using GymForge.Domain.Interface;
using GymForge.Infrastructure.Persistence;
using GymForge.Shared.Enums;
using GymForge.Contracts.Users;
using Microsoft.EntityFrameworkCore;

namespace GymForge.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _dbContext;

        public UserRepository(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<User?> GetUserByIdAsync(Guid userId)
        {
            return await _dbContext.Users
                .Include(u => u.Profile)
                    .ThenInclude(p => p.Address)
                .Include(u => u.Preference)
                .Include(u => u.Security)
                .FirstOrDefaultAsync(u => u.Id == userId);
        }

        public async Task<Guid?> GetBranchIdByUserIdAsync(Guid userId)
        {
            return await _dbContext.Staff
                .Where(s => s.UserId == userId && s.IsActive)
                .Select(s => s.BranchId)
                .FirstOrDefaultAsync();
        }

        public async Task LinkUserToGymMembersAsync(User user)
        {
            string emailLower = user.Email.ToLower();
            List<GymMember> unlinkedMembers = await _dbContext.GymMembers
                .Where(m => m.Email.ToLower() == emailLower && m.UserId == null)
                .ToListAsync();

            foreach (GymMember member in unlinkedMembers)
            {
                member.UserId = user.Id;
            }
        }

        public Task DeleteUserAsync(User user)
        {
            _dbContext.Users.Remove(user);
            return Task.CompletedTask;
        }

        public async Task<IEnumerable<User>> GetPendingDeletionRequestsAsync()
        {
            return await _dbContext.Users
                .Include(u => u.Security)
                .Where(u => u.Security != null && 
                            u.Security.DeletionRequestedOn != null && 
                            u.Role != UserRole.GymOwner && 
                            u.GymId == null)
                .ToListAsync();
        }

        public async Task<(IEnumerable<User> Items, int TotalCount)> GetStandaloneUsersAsync(int pageNumber, int pageSize, string? searchTerm)
        {
            IQueryable<User> query = _dbContext.Users
                .Include(u => u.Profile)
                .Include(u => u.Preference)
                .Include(u => u.Security)
                .Where(u => u.Role != UserRole.GymOwner && u.GymId == null);

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                string searchLower = searchTerm.ToLower();
                query = query.Where(u => 
                    u.FirstName.ToLower().Contains(searchLower) || 
                    u.LastName.ToLower().Contains(searchLower) || 
                    u.Email.ToLower().Contains(searchLower));
            }

            int totalCount = await query.CountAsync();

            List<User> items = await query
                .OrderByDescending(u => u.CreatedOn)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public Task UpdateUserAsync(User user)
        {
            _dbContext.Users.Update(user);
            return Task.CompletedTask;
        }

        public async Task<UserDashboardSummaryDto> GetUserDashboardSummaryAsync(Guid userId)
        {
            var summary = new UserDashboardSummaryDto();

            var user = await _dbContext.Users
                .Include(u => u.Profile)
                .Include(u => u.Preference)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null) return summary;

            summary.UserName = user.FirstName;
            summary.Greeting = DateTime.Now.Hour < 12 ? "Good morning" : (DateTime.Now.Hour < 17 ? "Good afternoon" : "Good evening");

            if (user.Preference != null)
            {
                summary.GoalTitle = user.Preference.PrimaryGoal;
                summary.TargetCalories = user.Preference.TargetCalories ?? 2500;
                summary.TargetTrainingTime = user.Preference.TargetTrainingTime ?? 60;
                summary.GoalProgressPct = 65; 
            }

            var measurement = await _dbContext.MemberMeasurements
                .Where(m => m.UserId == userId)
                .OrderByDescending(m => m.Date)
                .FirstOrDefaultAsync();

            if (measurement != null)
            {
                summary.CurrentWeight = measurement.Weight ?? 0;
                summary.BodyFat = measurement.BodyFatPercentage ?? 0;
                summary.BMI = measurement.BMI ?? 0;
            }

            var today = DateTime.UtcNow.Date;
            var startOfMonth = new DateTime(today.Year, today.Month, 1);

            var monthLogs = await _dbContext.WorkoutSessionLogs
                .Where(l => l.UserId == userId && l.Date >= startOfMonth && l.Status == "Completed")
                .ToListAsync();

            var todayLogs = monthLogs.Where(l => l.Date.Date == today).ToList();

            summary.MonthlySessionCount = monthLogs.Count;
            summary.MonthlySessionTarget = 20;
            summary.MonthlyCompletionPct = summary.MonthlySessionTarget > 0 ? (summary.MonthlySessionCount * 100) / summary.MonthlySessionTarget : 0;

            summary.ActiveTrainingTimeMinutes = todayLogs.Sum(l => l.TotalSets * 4); // 4 min per set
            summary.CaloriesBurnedToday = todayLogs.Sum(l => l.TotalSets * 18); // 18 cals per set

            summary.WorkoutStreak = monthLogs.Select(l => l.Date.Date).Distinct().Count();

            var activeRoutines = await _dbContext.DailyRoutines
                .Where(r => r.UserId == userId && r.IsActive)
                .OrderBy(r => r.Order)
                .ToListAsync();

            var todayCompletion = await _dbContext.DailyRoutineCompletions
                .FirstOrDefaultAsync(c => c.UserId == userId && c.Date == today);

            var completedIds = todayCompletion?.CompletedRoutineIds ?? new List<Guid>();

            summary.DailyRoutines = activeRoutines.Select(r => new DailyRoutineDto
            {
                Id = r.Id,
                Title = r.Title,
                Time = r.Time,
                Amount = r.Amount,
                Order = r.Order,
                Completed = completedIds.Contains(r.Id)
            }).ToList();

            return summary;
        }

        public async Task<IEnumerable<DailyRoutine>> GetDailyRoutinesAsync(Guid userId)
        {
            return await _dbContext.DailyRoutines.Where(r => r.UserId == userId && r.IsActive).OrderBy(r => r.Order).ToListAsync();
        }

        public async Task<DailyRoutine?> GetDailyRoutineByIdAsync(Guid id)
        {
            return await _dbContext.DailyRoutines.FirstOrDefaultAsync(r => r.Id == id);
        }

        public Task AddDailyRoutineAsync(DailyRoutine routine)
        {
            _dbContext.DailyRoutines.Add(routine);
            return Task.CompletedTask;
        }

        public Task UpdateDailyRoutineAsync(DailyRoutine routine)
        {
            _dbContext.DailyRoutines.Update(routine);
            return Task.CompletedTask;
        }

        public async Task<DailyRoutineCompletion?> GetDailyRoutineCompletionAsync(Guid userId, DateTime date)
        {
            return await _dbContext.DailyRoutineCompletions.FirstOrDefaultAsync(c => c.UserId == userId && c.Date == date.Date);
        }

        public Task AddDailyRoutineCompletionAsync(DailyRoutineCompletion completion)
        {
            _dbContext.DailyRoutineCompletions.Add(completion);
            return Task.CompletedTask;
        }

        public Task UpdateDailyRoutineCompletionAsync(DailyRoutineCompletion completion)
        {
            _dbContext.DailyRoutineCompletions.Update(completion);
            return Task.CompletedTask;
        }
    }
}
