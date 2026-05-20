using GymForge.Application.Modules.Gym.Interfaces;
using GymForge.Contracts.Gym.Dashboard;
using GymForge.Domain.Entities;
using GymForge.Domain.Interface;
using GymForge.Shared.Enums;
using System.Collections.Generic;

namespace GymForge.Application.Modules.Gym.Services
{
    public class GymOwnerDashboardService : IGymOwnerDashboardService
    {
        private readonly IGymMemberRepository _memberRepository;
        private readonly IInventoryRepository _inventoryRepository;
        private readonly IEquipmentRepository _equipmentRepository;
        private readonly IStaffRepository _staffRepository;
        private readonly IGymManagementRepository _gymManagementRepository;

        public GymOwnerDashboardService(
            IGymMemberRepository memberRepository,
            IInventoryRepository inventoryRepository,
            IEquipmentRepository equipmentRepository,
            IStaffRepository staffRepository,
            IGymManagementRepository gymManagementRepository)
        {
            _memberRepository = memberRepository;
            _inventoryRepository = inventoryRepository;
            _equipmentRepository = equipmentRepository;
            _staffRepository = staffRepository;
            _gymManagementRepository = gymManagementRepository;
        }

        public async Task<GymOwnerDashboardDto> GetGymOwnerDashboardStatsAsync(Guid gymId, Guid? branchId = null)
        {
            IEnumerable<GymMember>? members = await _memberRepository.GetAllByGymIdAsync(gymId);
            List<InventoryItem>? products = await _inventoryRepository.GetProductsByGymIdAsync(gymId);
            List<Equipment>? equipment = await _equipmentRepository.GetEquipmentByGymIdAsync(gymId, branchId);
            IEnumerable<Staff>? staff = await _staffRepository.GetAllByGymIdAsync(gymId);
            List<SaleTransaction> sales = await _inventoryRepository.GetSalesByGymIdAsync(gymId);

            if (branchId.HasValue)
            {
                Guid? mainBranchId = null;
                List<Branch>? branches = await _gymManagementRepository.GetBranchesByGymIdAsync(gymId);
                Branch? mainBranch = branches.FirstOrDefault(b => b.IsMainBranch);
                if (mainBranch != null)
                {
                    mainBranchId = mainBranch.Id;
                }

                bool isMain = branchId.Value == mainBranchId;

                members = members.Where(m => m.BranchId == branchId.Value || (isMain && m.BranchId == null));
                products = products.Where(p => p.BranchId == branchId.Value || (isMain && p.BranchId == null)).ToList();
                staff = staff.Where(s => s.BranchId == branchId.Value || (isMain && s.BranchId == null));
                sales = sales.Where(s => s.BranchId == branchId.Value || 
                                         (s.InventoryItem != null && s.InventoryItem.BranchId == branchId.Value) || 
                                         (isMain && s.BranchId == null)).ToList();
            }

            DateTime now = DateTime.UtcNow;
            DateTime firstDayOfMonth = new DateTime(now.Year, now.Month, 1);

            List<MemberSubscription> subscriptions = members.SelectMany(m => m.Subscriptions).ToList();
            
            int totalMembersNow = members.Count();
            int totalMembersLastMonth = members.Count(m => m.CreatedOn < firstDayOfMonth);
            double growth = 0;
            if (totalMembersLastMonth > 0)
            {
                growth = ((double)(totalMembersNow - totalMembersLastMonth) / totalMembersLastMonth) * 100;
            }
            else if (totalMembersNow > 0)
            {
                growth = 100;
            }

            decimal membershipRevenue = subscriptions
                .Where(s => s.CreatedOn >= firstDayOfMonth && s.PaymentStatus == PaymentStatus.Paid)
                .Sum(s => s.PricePaid);

            decimal productSalesRevenue = sales
                .Where(s => s.TransactionDate >= firstDayOfMonth)
                .Sum(s => s.TotalAmount);

            decimal monthlyRevenue = membershipRevenue + productSalesRevenue;

            List<RecentEnrollmentDto> recentEnrollments = members
                .OrderByDescending(m => m.CreatedOn)
                .Take(5)
                .Select(m => new RecentEnrollmentDto
                {
                    MemberName = $"{m.FirstName} {m.LastName}",
                    Email = m.Email,
                    EnrollmentDate = m.CreatedOn,
                    Status = m.Status.ToString(),
                    PlanName = m.Subscriptions.OrderByDescending(s => s.CreatedOn).Select(s => s.PlanNameSnapshot).FirstOrDefault() ?? "No Plan",
                    Initials = (m.FirstName.Length > 0 ? m.FirstName[0].ToString() : "") + (m.LastName.Length > 0 ? m.LastName[0].ToString() : "")
                })
                .ToList();

            List<UpcomingRenewalDto> upcomingRenewals = members
                .Where(m => m.Subscriptions.Any(s => s.IsActive && s.EndDate > now))
                .Select(m => new { 
                    Member = m, 
                    Sub = m.Subscriptions.Where(s => s.IsActive && s.EndDate > now).OrderBy(s => s.EndDate).First() 
                })
                .Where(x => x.Sub.EndDate <= now.AddDays(30))
                .OrderBy(x => x.Sub.EndDate)
                .Take(5)
                .Select(x => new UpcomingRenewalDto
                {
                    MemberName = $"{x.Member.FirstName} {x.Member.LastName}",
                    EndDate = x.Sub.EndDate,
                    DaysRemaining = (x.Sub.EndDate - now).Days
                })
                .ToList();

            return new GymOwnerDashboardDto
            {
                TotalMembers = totalMembersNow,
                MemberGrowthPercentage = Math.Round(growth, 1),
                ActiveMembers = members.Count(m => m.Status == MemberStatus.Active),
                FrozenMembers = members.Count(m => m.Status == MemberStatus.Freeze),
                NewMembersThisMonth = members.Count(m => m.CreatedOn >= firstDayOfMonth),
                TodayAttendance = 0,
                MonthlyRevenue = monthlyRevenue,
                MembershipRevenue = membershipRevenue,
                ProductSalesRevenue = productSalesRevenue,
                PendingInvoices = subscriptions.Count(s => s.PaymentStatus == PaymentStatus.Pending),
                LowStockItems = products.Count(p => p.StockQuantity <= p.ReorderLevel),
                ActiveTrainers = staff.Count(s => s.Role == StaffRole.Trainer && s.IsActive),
                SupportStaffCount = staff.Count(s => s.Role != StaffRole.Trainer && s.IsActive),
                MaintenanceDueCount = equipment.Count(e => e.HealthPercentage < 70 || e.IsInMaintenance),
                RecentEnrollments = recentEnrollments,
                UpcomingRenewals = upcomingRenewals
            };
        }
    }
}
