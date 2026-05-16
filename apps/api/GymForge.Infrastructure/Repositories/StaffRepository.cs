using GymForge.Domain.Entities;
using GymForge.Domain.Interface;
using GymForge.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GymForge.Infrastructure.Repositories
{
    public class StaffRepository : IStaffRepository
    {
        private readonly AppDbContext _dbContext;

        public StaffRepository(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task AddAsync(Staff staff)
        {
            await _dbContext.Staff.AddAsync(staff);
        }

        public async Task<Staff?> GetByIdAsync(Guid id)
        {
            return await _dbContext.Staff
                .Include(x => x.PTAssignments)
                .ThenInclude(a => a.Member)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<IEnumerable<Staff>> GetAllByGymIdAsync(Guid gymId)
        {
            return await _dbContext.Staff
                .AsNoTracking()
                .Where(x => x.GymId == gymId)
                .OrderBy(x => x.LastName)
                .ToListAsync();
        }

        public async Task<(IEnumerable<Staff> Items, int TotalCount)> GetPagedStaffAsync(Guid gymId, int pageNumber, int pageSize, string? searchTerm)
        {
            IQueryable<Staff> query = _dbContext.Staff
                .AsNoTracking()
                .Where(x => x.GymId == gymId);

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                searchTerm = searchTerm.ToLower();
                query = query.Where(x => x.FirstName.ToLower().Contains(searchTerm) ||
                                       x.LastName.ToLower().Contains(searchTerm) ||
                                       x.Email.ToLower().Contains(searchTerm));
            }

            int totalCount = await query.CountAsync();

            List<Staff> items = await query
                .OrderBy(x => x.LastName)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public Task UpdateAsync(Staff staff)
        {
            _dbContext.Staff.Update(staff);
            return Task.CompletedTask;
        }

        public async Task DeleteAsync(Guid id)
        {
            Staff? staff = await _dbContext.Staff.FindAsync(id);
            if (staff != null)
            {
                _dbContext.Staff.Remove(staff);
            }
        }

        public Task<bool> ExistsByEmailAsync(string email, Guid gymId)
        {
            return _dbContext.Staff.AnyAsync(x => x.Email == email && x.GymId == gymId);
        }

        public async Task AddPTAssignmentAsync(PTAssignment assignment)
        {
            await _dbContext.PTAssignments.AddAsync(assignment);
        }

        public async Task<IEnumerable<PTAssignment>> GetAssignmentsByTrainerIdAsync(Guid trainerId)
        {
            return await _dbContext.PTAssignments
                .Include(x => x.Member)
                .Where(x => x.TrainerId == trainerId && x.IsActive)
                .ToListAsync();
        }

        public async Task<IEnumerable<PTAssignment>> GetAssignmentsByMemberIdAsync(Guid memberId)
        {
            return await _dbContext.PTAssignments
                .Include(x => x.Trainer)
                .Where(x => x.MemberId == memberId && x.IsActive)
                .ToListAsync();
        }

        public async Task AddMeasurementAsync(MemberMeasurement measurement)
        {
            await _dbContext.MemberMeasurements.AddAsync(measurement);
        }

        public async Task<IEnumerable<MemberMeasurement>> GetMeasurementsByMemberIdAsync(Guid memberId)
        {
            return await _dbContext.MemberMeasurements
                .AsNoTracking()
                .Include(x => x.RecordedBy)
                .Where(x => x.MemberId == memberId)
                .OrderByDescending(x => x.Date)
                .ToListAsync();
        }
    }
}
