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

        public async Task DeleteUserAsync(User user)
        {
            // Delete custom personal plans authored by this user
            await _dbContext.WorkoutPlans
                .Where(p => p.CreatedBy == user.Id && p.IsCustom)
                .ExecuteDeleteAsync();

            await _dbContext.DietPlans
                .Where(p => p.CreatedBy == user.Id && p.IsCustom)
                .ExecuteDeleteAsync();

            _dbContext.Users.Remove(user);
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
                summary.GoalProgressPct = 0; 
            }

            var latestMeasurement = await _dbContext.MemberMeasurements
                .Where(m => m.UserId == userId)
                .OrderByDescending(m => m.Date)
                .FirstOrDefaultAsync();

            if (latestMeasurement != null)
            {
                summary.CurrentWeight = latestMeasurement.Weight ?? 0;
                summary.BodyFat = latestMeasurement.BodyFatPercentage ?? 0;
                summary.BMI = latestMeasurement.BMI ?? 0;

                var firstMeasurement = await _dbContext.MemberMeasurements
                    .Where(m => m.UserId == userId && m.Weight.HasValue)
                    .OrderBy(m => m.Date)
                    .FirstOrDefaultAsync();

                if (firstMeasurement != null && user.Preference?.TargetWeight.HasValue == true && latestMeasurement.Weight.HasValue)
                {
                    double initialWeight = firstMeasurement.Weight.Value;
                    double currentWeight = latestMeasurement.Weight.Value;
                    double targetWeight = user.Preference.TargetWeight.Value;

                    if (initialWeight != targetWeight)
                    {
                        double progress = (targetWeight < initialWeight) 
                            ? (initialWeight - currentWeight) / (initialWeight - targetWeight) * 100
                            : (currentWeight - initialWeight) / (targetWeight - initialWeight) * 100;

                        summary.GoalProgressPct = Math.Clamp((int)Math.Round(progress), 0, 100);
                    }
                    else
                    {
                        summary.GoalProgressPct = 100;
                    }
                }
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
