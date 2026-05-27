using GymForge.Contracts.Gym.Management;
using GymForge.Contracts.Gym.Owners;
using GymForge.Contracts.Gym.Onboarding;
using GymForge.Domain.Entities;
using GymForge.Domain.Interface;
using GymForge.Infrastructure.Persistence;
using GymForge.Shared.Enums;
using Microsoft.EntityFrameworkCore;

namespace GymForge.Infrastructure.Repositories
{
    public class GymManagementRepository : IGymManagementRepository
    {
        private readonly AppDbContext _dbContext;

        public GymManagementRepository(AppDbContext dbContext) 
        {
            _dbContext = dbContext;
        }

        public async Task AddGymAsync(Gym gym)
        {
            await _dbContext.Gyms.AddAsync(gym);
        }

        public async Task AddBranchAsync(Branch branch)
        {
            await _dbContext.Branches.AddAsync(branch);
        }

        public async Task AddGymSubscriptionAsync(SubscriptionRecord subscription)
        {
            await _dbContext.SubscriptionRecords.AddAsync(subscription);
        }

        public async Task<(List<GymOwnersDto> Items, int TotalCount)> GetGymOwnersList(int pageNumber, int pageSize, string? searchTerm)
        {
            IQueryable<User> query = _dbContext.Users.Where(x => x.Role == UserRole.GymOwner);

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                searchTerm = searchTerm.ToLower();
                query = query.Where(u => u.FirstName.ToLower().Contains(searchTerm) ||
                                       u.LastName.ToLower().Contains(searchTerm) ||
                                       u.Email.ToLower().Contains(searchTerm) ||
                                       u.Phone.ToLower().Contains(searchTerm));
            }

            int totalCount = await query.CountAsync();

            List<GymOwnersDto> items = await query.Select(u => new GymOwnersDto
            {
                Id = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Name = u.FirstName + " " + u.LastName,
                Email = u.Email,
                Phone = u.Phone,
                GymsOwned = u.Gyms != null ? u.Gyms.Count : 0,
                JoinedDate = u.CreatedOn,
                Status = u.IsActive ? "Active" : "Inactive",
                InvitationStatus = u.IsInvitationAccepted ? "Accepted" :
                                     (u.InvitationExpiry > DateTime.UtcNow ? "Pending" : "Expired")
            })
            .OrderByDescending(u => u.JoinedDate)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

            return (items, totalCount);
        }

        public async Task<User?> GetGymOwnerByIdAsync(Guid id)
        {
            User? user = await _dbContext.Users.FirstOrDefaultAsync(x => x.Id == id);
            return user;
        }

        public async Task<(List<GymListResponseDto> Items, int TotalCount)> GetGymListAsync(int pageNumber, int pageSize, string? searchTerm)
        {
            IQueryable<Gym> query = _dbContext.Gyms.AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                searchTerm = searchTerm.ToLower();
                query = query.Where(g => g.GymName.ToLower().Contains(searchTerm) ||
                                       (g.BrandName != null && g.BrandName.ToLower().Contains(searchTerm)) ||
                                       (g.Email != null && g.Email.ToLower().Contains(searchTerm)));
            }

            int totalCount = await query.CountAsync();

            List<GymListResponseDto> items = await query
                .Include(x => x.Owner)
                .Include(x => x.Branches)
                .Select(g => new GymListResponseDto
                {
                    Id = g.Id,
                    GymName = g.GymName,
                    BrandName = g.BrandName,
                    OwnerName = g.Owner.FirstName + " " + g.Owner.LastName,
                    Email = g.Email,
                    Phone = g.Phone,
                    IsActive = g.IsActive,
                    IsVerified = g.IsVerified,
                    BranchesCount = g.Branches != null ? g.Branches.Count : 0,
                    Description = g.Description,
                    WebsiteUrl = g.WebsiteUrl,
                    GstNumber = g.GstNumber,
                    RegistrationNumber = g.RegistrationNumber,
                    EstablishedDate = g.EstablishedDate,
                    LogoUrl = g.LogoUrl,
                    BannerUrl = g.BannerUrl,
                    InvoicePrefix = g.InvoicePrefix,
                    DefaultTaxRate = g.DefaultTaxRate,
                    OverdueGraceDays = g.OverdueGraceDays,
                    AutoEmailReceipts = g.AutoEmailReceipts,
                    CreatedOn = g.CreatedOn,
                    ModifiedOn = (DateTime)g.ModifiedOn!,
                    // Get latest active subscription
                    PlanName = _dbContext.SubscriptionRecords
                        .Where(s => s.GymId == g.Id && s.IsActive)
                        .OrderByDescending(s => s.CreatedOn)
                        .Select(s => s.Plan.Name)
                        .FirstOrDefault(),
                    SubscriptionExpiry = _dbContext.SubscriptionRecords
                        .Where(s => s.GymId == g.Id && s.IsActive)
                        .OrderByDescending(s => s.CreatedOn)
                        .Select(s => (DateTime?)s.EndDate)
                        .FirstOrDefault(),
                    IsTrialPlan = _dbContext.SubscriptionRecords
                        .Where(s => s.GymId == g.Id && s.IsActive)
                        .OrderByDescending(s => s.CreatedOn)
                        .Select(s => s.IsTrial)
                        .FirstOrDefault(),
                    PaymentStatus = _dbContext.SaaSPaymentTransactions
                        .Any(t => t.GymId == g.Id && t.Status == "Success") ? "Paid" :
                        (_dbContext.SubscriptionRecords.Any(s => s.GymId == g.Id) ? "Pending" : "Unpaid")
                })
                .OrderByDescending(g => g.CreatedOn)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public User UpdateGymOwner(User gymOwner)
        {
            _dbContext.Users.Update(gymOwner);
            return gymOwner;
        }

        public async Task<Gym?> GetGymByIdAsync(Guid id)
        {
            return await _dbContext.Gyms.FindAsync(id);
        }

        public Gym UpdateGym(Gym gym)
        {
            _dbContext.Gyms.Update(gym);
            return gym;
        }

        public async Task DeleteGymAsync(Guid gymId)
        {
            Gym? gym = await _dbContext.Gyms.FindAsync(gymId);
            if (gym != null)
            {
                gym.IsActive = false;
            }
        }

        public async Task<List<Branch>> GetBranchesByGymIdAsync(Guid gymId)
        {
            return await _dbContext.Branches
                .Include(b => b.Address)
                .Where(b => b.GymId == gymId)
                .OrderByDescending(b => b.CreatedOn)
                .ToListAsync();
        }

        public async Task<Branch?> GetBranchByIdAsync(Guid id)
        {
            return await _dbContext.Branches
                .Include(b => b.Address)
                .FirstOrDefaultAsync(b => b.Id == id);
        }

        public Branch UpdateBranch(Branch branch)
        {
            _dbContext.Branches.Update(branch);
            return branch;
        }

        public async Task<GymListResponseDto?> GetGymByOwnerIdAsync(Guid ownerId)
        {
            return await _dbContext.Gyms
                .Where(g => g.OwnerUserId == ownerId)
                .Include(x => x.Owner)
                .Include(x => x.Branches)
                .Select(g => new GymListResponseDto
                {
                    Id = g.Id,
                    GymName = g.GymName,
                    BrandName = g.BrandName,
                    OwnerName = g.Owner.FirstName + " " + g.Owner.LastName,
                    Email = g.Email,
                    Phone = g.Phone,
                    IsActive = g.IsActive,
                    IsVerified = g.IsVerified,
                    BranchesCount = g.Branches != null ? g.Branches.Count : 0,
                    Description = g.Description,
                    WebsiteUrl = g.WebsiteUrl,
                    GstNumber = g.GstNumber,
                    RegistrationNumber = g.RegistrationNumber,
                    EstablishedDate = g.EstablishedDate,
                    LogoUrl = g.LogoUrl,
                    BannerUrl = g.BannerUrl,
                    InvoicePrefix = g.InvoicePrefix,
                    DefaultTaxRate = g.DefaultTaxRate,
                    OverdueGraceDays = g.OverdueGraceDays,
                    AutoEmailReceipts = g.AutoEmailReceipts,
                    CreatedOn = g.CreatedOn,
                    ModifiedOn = (DateTime)g.ModifiedOn!,
                    PlanName = _dbContext.SubscriptionRecords
                        .Where(s => s.GymId == g.Id && s.IsActive)
                        .OrderByDescending(s => s.CreatedOn)
                        .Select(s => s.Plan.Name)
                        .FirstOrDefault(),
                    SubscriptionExpiry = _dbContext.SubscriptionRecords
                        .Where(s => s.GymId == g.Id && s.IsActive)
                        .OrderByDescending(s => s.CreatedOn)
                        .Select(s => (DateTime?)s.EndDate)
                        .FirstOrDefault(),
                    IsTrialPlan = _dbContext.SubscriptionRecords
                        .Where(s => s.GymId == g.Id && s.IsActive)
                        .OrderByDescending(s => s.CreatedOn)
                        .Select(s => s.IsTrial)
                        .FirstOrDefault(),
                    PaymentStatus = _dbContext.SaaSPaymentTransactions
                        .Any(t => t.GymId == g.Id && t.Status == "Success") ? "Paid" :
                        (_dbContext.SubscriptionRecords.Any(s => s.GymId == g.Id) ? "Pending" : "Unpaid")
                })
                .FirstOrDefaultAsync();
        }
        public async Task<List<GymListResponseDto>> GetAllGymsAsync()
        {
            return await _dbContext.Gyms
                .Include(x => x.Owner)
                .Include(x => x.Branches)
                .Select(g => new GymListResponseDto
                {
                    Id = g.Id,
                    GymName = g.GymName,
                    BrandName = g.BrandName,
                    OwnerName = g.Owner.FirstName + " " + g.Owner.LastName,
                    Email = g.Email,
                    Phone = g.Phone,
                    IsActive = g.IsActive,
                    IsVerified = g.IsVerified,
                    BranchesCount = g.Branches != null ? g.Branches.Count : 0,
                    Description = g.Description,
                    WebsiteUrl = g.WebsiteUrl,
                    GstNumber = g.GstNumber,
                    RegistrationNumber = g.RegistrationNumber,
                    EstablishedDate = g.EstablishedDate,
                    LogoUrl = g.LogoUrl,
                    BannerUrl = g.BannerUrl,
                    InvoicePrefix = g.InvoicePrefix,
                    DefaultTaxRate = g.DefaultTaxRate,
                    OverdueGraceDays = g.OverdueGraceDays,
                    AutoEmailReceipts = g.AutoEmailReceipts,
                    CreatedOn = g.CreatedOn,
                    ModifiedOn = (DateTime)g.ModifiedOn!,
                    PlanName = _dbContext.SubscriptionRecords
                        .Where(s => s.GymId == g.Id && s.IsActive)
                        .OrderByDescending(s => s.CreatedOn)
                        .Select(s => s.Plan.Name)
                        .FirstOrDefault(),
                    SubscriptionExpiry = _dbContext.SubscriptionRecords
                        .Where(s => s.GymId == g.Id && s.IsActive)
                        .OrderByDescending(s => s.CreatedOn)
                        .Select(s => (DateTime?)s.EndDate)
                        .FirstOrDefault(),
                    IsTrialPlan = _dbContext.SubscriptionRecords
                        .Where(s => s.GymId == g.Id && s.IsActive)
                        .OrderByDescending(s => s.CreatedOn)
                        .Select(s => s.IsTrial)
                        .FirstOrDefault(),
                    PaymentStatus = _dbContext.SaaSPaymentTransactions
                        .Any(t => t.GymId == g.Id && t.Status == "Success") ? "Paid" :
                        (_dbContext.SubscriptionRecords.Any(s => s.GymId == g.Id) ? "Pending" : "Unpaid")
                })
                .OrderByDescending(g => g.CreatedOn)
                .ToListAsync();
        }

        public async Task<List<Staff>> GetBranchManagersAsync(Guid gymId)
        {
            return await _dbContext.Staff
                .Where(s => s.GymId == gymId && s.Role == StaffRole.Manager && s.IsActive)
                .ToListAsync();
        }
    }
}
