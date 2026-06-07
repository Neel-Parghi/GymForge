using GymForge.Domain.Entities;
using GymForge.Domain.Interface;
using GymForge.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GymForge.Infrastructure.Repositories
{
    public class MemberWorkoutRepository : IMemberWorkoutRepository
    {
        private readonly AppDbContext _dbContext;

        public MemberWorkoutRepository(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<MemberPlanAssignment?> GetActivePlanAssignmentAsync(Guid memberId)
        {
            return await _dbContext.MemberPlanAssignments
                .Include(mpa => mpa.CustomScheduleDays)
                .Where(mpa => mpa.MemberId == memberId && mpa.IsActive)
                .OrderByDescending(mpa => mpa.AssignedAt)
                .FirstOrDefaultAsync();
        }

        public async Task AddPlanAssignmentAsync(MemberPlanAssignment assignment)
        {
            await _dbContext.MemberPlanAssignments.AddAsync(assignment);
        }

        public async Task<IEnumerable<WorkoutSessionLog>> GetWorkoutLogsAsync(Guid memberId)
        {
            return await _dbContext.WorkoutSessionLogs
                .Include(l => l.LoggedExercises)
                    .ThenInclude(e => e.LoggedSets)
                .Where(l => l.MemberId == memberId)
                .OrderByDescending(l => l.Date)
                .ToListAsync();
        }

        public async Task AddWorkoutSessionLogAsync(WorkoutSessionLog log)
        {
            await _dbContext.WorkoutSessionLogs.AddAsync(log);
        }

        public async Task RemoveWorkoutSessionLogsAsync(IEnumerable<WorkoutSessionLog> logs)
        {
            _dbContext.WorkoutSessionLogs.RemoveRange(logs);
            await Task.CompletedTask;
        }

        public async Task<IEnumerable<WorkoutSessionLog>> GetLogsByDateAsync(Guid memberId, DateTime date)
        {
            DateTime targetDate = date.Date;
            return await _dbContext.WorkoutSessionLogs
                .Where(l => l.MemberId == memberId && l.Date.Date == targetDate)
                .ToListAsync();
        }

        public async Task AddOrUpdateScheduleDayAsync(MemberWorkoutScheduleDay scheduleDay)
        {
            MemberWorkoutScheduleDay? existing = await _dbContext.MemberWorkoutScheduleDays
                .FirstOrDefaultAsync(s => s.MemberPlanAssignmentId == scheduleDay.MemberPlanAssignmentId && s.DayOfWeek == scheduleDay.DayOfWeek);

            if (existing != null)
            {
                existing.WorkoutPlanDayId = scheduleDay.WorkoutPlanDayId;
                existing.IsRestDay = scheduleDay.IsRestDay;
                existing.ModifiedOn = DateTime.UtcNow;
                _dbContext.MemberWorkoutScheduleDays.Update(existing);
            }
            else
            {
                await _dbContext.MemberWorkoutScheduleDays.AddAsync(scheduleDay);
            }
        }

        public async Task<IEnumerable<MemberPlanAssignment>> GetPlanAssignmentsAsync(Guid memberId)
        {
            return await _dbContext.MemberPlanAssignments
                .Include(mpa => mpa.CustomScheduleDays)
                .Include(mpa => mpa.WorkoutPlan)
                    .ThenInclude(p => p.Days)
                        .ThenInclude(d => d.Exercises)
                .Where(mpa => mpa.MemberId == memberId)
                .OrderBy(mpa => mpa.AssignedAt)
                .ToListAsync();
        }
    }
}
