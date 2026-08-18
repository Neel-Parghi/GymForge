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

        // Calories / active minutes heuristic constants
        private const double StrengthMinutesPerSet = 3.0;
        private const double CardioMinutesPerSet = 8.0;
        private const double StrengthCaloriesPerMinute = 6.0;
        private const double CardioCaloriesPerMinute = 10.0;
        private const double VolumeCalorieFactor = 0.01; // kcal per (kg lifted * rep) of logged volume

        // Muscle recovery window constants
        private const double DefaultRecoveryHours = 48;
        private static readonly Dictionary<string, double> MuscleRecoveryHours = new(StringComparer.OrdinalIgnoreCase)
        {
            ["Back"] = 72,
            ["Chest"] = 72,
            ["Legs"] = 72,
            ["Shoulders"] = 60,
            ["Biceps"] = 36,
            ["Triceps"] = 36,
            ["Core"] = 36,
            ["Cardio"] = 24,
        };
        private const int RecoveryLookbackDays = 30;

        // Streak calculation constants
        private const int StreakLookbackDays = 400; // safety bound on how far back we scan

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
                if (user.GymId == null) 
                {
                    user.GymId = member.GymId;
                }
            }
        }

        public async Task DeleteUserAsync(User user)
        {
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

            summary.MonthlySessionCount = monthLogs.Count;
            summary.MonthlySessionTarget = 20;
            summary.MonthlyCompletionPct = summary.MonthlySessionTarget > 0 ? (summary.MonthlySessionCount * 100) / summary.MonthlySessionTarget : 0;

            // Calories & active minutes: derived from actual completed sets today, split by
            // cardio vs strength (different time-per-set and calorie burn rates), plus a small
            // volume bonus so heavier/higher-rep sets burn more than light ones.
            var todaySets = await _dbContext.WorkoutSessionLogs
                .Where(l => l.UserId == userId && l.Date.Date == today && l.Status == "Completed")
                .SelectMany(l => l.LoggedExercises)
                .Where(e => !e.Skipped)
                .SelectMany(e => e.LoggedSets
                    .Where(s => s.Completed)
                    .Select(s => new { e.IsCardio, s.Weight, s.Reps }))
                .ToListAsync();

            double cardioMinutes = todaySets.Count(s => s.IsCardio) * CardioMinutesPerSet;
            double strengthMinutes = todaySets.Count(s => !s.IsCardio) * StrengthMinutesPerSet;
            double volumeBonusCalories = todaySets.Sum(s => s.Weight * s.Reps) * VolumeCalorieFactor;

            summary.ActiveTrainingTimeMinutes = (int)Math.Round(cardioMinutes + strengthMinutes);
            summary.CaloriesBurnedToday = (int)Math.Round(
                (cardioMinutes * CardioCaloriesPerMinute) +
                (strengthMinutes * StrengthCaloriesPerMinute) +
                volumeBonusCalories);

            var (streak, streakAtRisk) = await CalculateWorkoutStreakAsync(userId, today);
            summary.WorkoutStreak = streak;
            summary.StreakAtRisk = streakAtRisk;

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

            // 1. Trophy Room (Personal Records) - All-time max weights per exercise
            var allTimeSets = await _dbContext.WorkoutSessionLogs
                .Where(l => l.UserId == userId && l.Status == "Completed")
                .SelectMany(l => l.LoggedExercises)
                .SelectMany(e => e.LoggedSets)
                .Where(s => s.Completed && s.Weight > 0)
                .Select(s => new { s.LoggedExercise.Name, s.Weight, Date = s.LoggedExercise.WorkoutSessionLog.Date })
                .ToListAsync();

            var topPRs = allTimeSets
                .GroupBy(s => s.Name)
                .Select(g => g.OrderByDescending(s => s.Weight).First())
                .OrderByDescending(s => s.Weight)
                .Take(3)
                .Select(s => new PersonalRecordDto
                {
                    Name = s.Name,
                    Weight = s.Weight + " kg",
                    Date = s.Date.ToString("MMM yyyy")
                }).ToList();

            summary.PersonalRecords = topPRs;

            // 2. Muscle Recovery & Activation Heatmap
            var sevenDaysAgo = today.AddDays(-7);
            var recoveryLookbackStart = today.AddDays(-RecoveryLookbackDays);

            // Look back far enough (30 days) to find the last time each muscle group was
            // actually trained, so groups untouched for >7 days still resolve to "Ready"
            // instead of silently disappearing from the recovery list.
            var recentExercises = await _dbContext.WorkoutSessionLogs
                .Where(l => l.UserId == userId && l.Date >= recoveryLookbackStart && l.Status == "Completed")
                .SelectMany(l => l.LoggedExercises)
                .Where(e => !e.Skipped)
                .Select(e => new {
                    ExerciseName = e.Name,
                    Date = e.WorkoutSessionLog.Date,
                    SetCount = e.LoggedSets.Count(s => s.Completed)
                })
                .ToListAsync();

            static string NormalizeExerciseName(string name) =>
                string.IsNullOrWhiteSpace(name) ? string.Empty : name.Trim().ToLowerInvariant();

            var masterExercises = await _dbContext.Exercises
                .Select(e => new { e.Name, e.Category })
                .ToListAsync();

            var categoryMap = masterExercises
                .GroupBy(e => NormalizeExerciseName(e.Name))
                .ToDictionary(g => g.Key, g => g.First().Category);

            var recentByCategory = recentExercises
                .Select(e => new {
                    Category = categoryMap.GetValueOrDefault(NormalizeExerciseName(e.ExerciseName)),
                    e.Date,
                    e.SetCount
                })
                .Where(e => !string.IsNullOrEmpty(e.Category))
                .GroupBy(e => e.Category)
                .ToList();

            foreach (var group in recentByCategory)
            {
                var category = group.Key!;
                var latestDate = group.Max(e => e.Date);
                var hoursSinceTrained = (DateTime.UtcNow - latestDate).TotalHours;

                // Muscle Recovery Logic: larger muscle groups need longer to recover than
                // smaller ones, instead of one flat window for every group.
                var recoveryWindowHours = MuscleRecoveryHours.GetValueOrDefault(category, DefaultRecoveryHours);
                var recoveryStatus = hoursSinceTrained < recoveryWindowHours ? "Recovering" : "Ready";
                var recoveryPct = hoursSinceTrained < recoveryWindowHours
                    ? (int)Math.Clamp((hoursSinceTrained / recoveryWindowHours) * 100, 0, 100)
                    : 100;

                summary.MuscleRecovery.Add(new MuscleRecoveryDto
                {
                    Name = category,
                    Status = recoveryStatus,
                    Pct = recoveryPct
                });

                // Activation Heatmap Logic: volume is still scoped to the last 7 days only,
                // independent of the wider recovery lookback above.
                var totalSetsLast7Days = group.Where(e => e.Date >= sevenDaysAgo).Sum(e => e.SetCount);
                if (totalSetsLast7Days <= 0) continue;

                string level;
                string label;
                if (totalSetsLast7Days >= 10)
                {
                    level = "High";
                    label = "High Volume";
                }
                else if (totalSetsLast7Days >= 5)
                {
                    level = "Medium";
                    label = "Moderate";
                }
                else
                {
                    level = "Low";
                    label = "Light";
                }

                summary.MuscleHeatmap.Add(new MuscleHeatmapDto
                {
                    Name = category,
                    Level = level,
                    Label = label
                });
            }

            // 3. Active Plans
            var activeWorkoutPlan = await _dbContext.MemberPlanAssignments
                .Include(p => p.WorkoutPlan)
                .FirstOrDefaultAsync(p => p.UserId == userId && p.IsActive);

            if (activeWorkoutPlan != null && activeWorkoutPlan.WorkoutPlan != null)
            {
                summary.ActiveWorkoutPlan = new ActivePlanSummaryDto
                {
                    PlanId = activeWorkoutPlan.WorkoutPlanId,
                    Name = activeWorkoutPlan.WorkoutPlan.Name,
                    Type = activeWorkoutPlan.WorkoutPlan.Level.ToString()
                };
            }

            var activeDietPlan = await _dbContext.MemberDietAssignments
                .Include(p => p.DietPlan)
                .FirstOrDefaultAsync(p => p.UserId == userId && p.IsActive);

            if (activeDietPlan != null && activeDietPlan.DietPlan != null)
            {
                summary.ActiveDietPlan = new ActivePlanSummaryDto
                {
                    PlanId = activeDietPlan.DietPlanId,
                    Name = activeDietPlan.DietPlan.Name,
                    Type = activeDietPlan.DietPlan.Goal
                };
            }

            return summary;
        }

        private enum DayStatus { Completed, RestDay, Missed, Pending, NoSchedule }

        // Consecutive-day streak that respects the workout calendar: a completed workout
        // extends it, a single rest day passes through without breaking it, two consecutive
        // rest days end it (an extended break is treated as intentional), and a scheduled
        // workout day with no log ends it. Today is never allowed to break the streak by
        // itself (StreakAtRisk flags that case instead) - it just isn't counted until logged
        // or until the calendar shows it wasn't a workout day in the first place.
        private async Task<(int Streak, bool StreakAtRisk)> CalculateWorkoutStreakAsync(Guid userId, DateTime today)
        {
            var lookbackStart = today.AddDays(-StreakLookbackDays);

            var logs = await _dbContext.WorkoutSessionLogs
                .Where(l => l.UserId == userId && l.Date >= lookbackStart && l.Date <= today)
                .Select(l => new { l.Date, l.Status })
                .ToListAsync();

            var logStatusByDate = logs
                .GroupBy(l => l.Date.Date)
                .ToDictionary(g => g.Key, g => g.First().Status);

            var assignments = await _dbContext.MemberPlanAssignments
                .Include(a => a.WorkoutPlan)
                    .ThenInclude(p => p.Days)
                .Include(a => a.CustomScheduleDays)
                .Where(a => a.UserId == userId && a.AssignedAt.Date <= today)
                .OrderByDescending(a => a.AssignedAt)
                .ToListAsync();

            DayStatus ResolveDayStatus(DateTime date, bool isToday)
            {
                if (logStatusByDate.TryGetValue(date, out var status))
                {
                    if (status == "Completed") return DayStatus.Completed;
                    if (status == "RestDay") return DayStatus.RestDay;
                    return isToday ? DayStatus.Pending : DayStatus.Missed;
                }

                var assignment = assignments.FirstOrDefault(a => a.AssignedAt.Date <= date);
                if (assignment?.WorkoutPlan == null) return DayStatus.NoSchedule;

                bool isRestDay = ResolveIsRestDay(date, assignment);
                if (isRestDay) return DayStatus.RestDay;
                return isToday ? DayStatus.Pending : DayStatus.Missed;
            }

            var todayStatus = ResolveDayStatus(today, isToday: true);

            // Grace period: if today is a scheduled workout day that hasn't been logged yet,
            // don't break the streak for it right now - just leave it out of the count and
            // flag it as at-risk. It only turns into a real break once the day has passed.
            var cursor = (todayStatus == DayStatus.Pending || todayStatus == DayStatus.NoSchedule)
                ? today.AddDays(-1)
                : today;

            int streak = 0;
            int consecutiveRestDays = 0;

            for (int i = 0; i < StreakLookbackDays; i++)
            {
                var status = ResolveDayStatus(cursor, isToday: false);

                if (status == DayStatus.Completed)
                {
                    streak++;
                    consecutiveRestDays = 0;
                    cursor = cursor.AddDays(-1);
                }
                else if (status == DayStatus.RestDay)
                {
                    consecutiveRestDays++;
                    if (consecutiveRestDays >= 2) break;
                    cursor = cursor.AddDays(-1);
                }
                else
                {
                    break; // Missed a scheduled workout day, or no schedule to evaluate further back
                }
            }

            bool streakAtRisk = todayStatus == DayStatus.Pending && streak > 0;
            return (streak, streakAtRisk);
        }

        // Resolves whether a given date was a rest day per the plan/schedule that was active
        // on that date: an explicit recurring weekday override wins, then a plan day whose
        // name names that weekday, then a Monday-indexed positional fallback (mirrors the
        // resolution the Angular workout calendar performs client-side).
        private static bool ResolveIsRestDay(DateTime date, MemberPlanAssignment assignment)
        {
            var weekday = date.DayOfWeek.ToString();

            var overrideDay = assignment.CustomScheduleDays?
                .FirstOrDefault(o => string.Equals(o.DayOfWeek, weekday, StringComparison.OrdinalIgnoreCase));
            if (overrideDay != null) return overrideDay.IsRestDay;

            var days = assignment.WorkoutPlan.Days.OrderBy(d => d.DayIndex).ToList();

            var namedDay = days.FirstOrDefault(d =>
                !string.IsNullOrWhiteSpace(d.DayName) &&
                d.DayName.Contains(weekday, StringComparison.OrdinalIgnoreCase));
            if (namedDay != null) return namedDay.IsRestDay;

            int mondayBasedIndex = ((int)date.DayOfWeek + 6) % 7;
            if (mondayBasedIndex < days.Count) return days[mondayBasedIndex].IsRestDay;

            return true;
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
