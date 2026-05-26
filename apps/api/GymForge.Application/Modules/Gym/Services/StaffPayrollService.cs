using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GymForge.Contracts.Gym.Billing;
using GymForge.Domain.Entities;
using GymForge.Domain.Interface;
using GymForge.Shared.Enums;
using GymForge.Application.Modules.Gym.Interfaces;

namespace GymForge.Application.Modules.Gym.Services
{
    public class StaffPayrollService : IStaffPayrollService
    {
        private readonly IMemberBillingRepository _billingRepository;
        private readonly IStaffRepository _staffRepository;
        private readonly IUnitOfWork _unitOfWork;

        public StaffPayrollService(
            IMemberBillingRepository billingRepository,
            IStaffRepository staffRepository,
            IUnitOfWork unitOfWork)
        {
            _billingRepository = billingRepository;
            _staffRepository = staffRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<StaffPayrollOverviewDto> GetStaffPayrollOverviewAsync(Guid gymId, Guid? branchId, string monthKey)
        {
            int year = int.Parse(monthKey.Split('-')[0]);
            int month = int.Parse(monthKey.Split('-')[1]);

            DateTime startDate = new(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
            DateTime endDate = startDate.AddMonths(1).AddTicks(-1);

            IEnumerable<Staff> staffMembers = await _staffRepository.GetAllByGymIdAsync(gymId, branchId);
            IEnumerable<StaffPayrollRule> rules = await _billingRepository.GetPayrollRulesAsync(gymId, branchId);
            IEnumerable<StaffPayoutLog> logs = await _billingRepository.GetPayoutLogsByMonthAsync(gymId, monthKey, branchId);
            IEnumerable<SaleTransaction> transactions = await _billingRepository.GetTransactionsByMonthAsync(gymId, startDate, endDate);

            List<StaffPayoutDto> payoutsList = new();

            foreach (Staff staff in staffMembers)
            {
                StaffPayrollRule? rule = rules.FirstOrDefault(r => r.StaffId == staff.Id);
                if (rule == null)
                {
                    rule = new StaffPayrollRule
                    {
                        Id = Guid.NewGuid(),
                        GymId = gymId,
                        BranchId = staff.BranchId,
                        StaffId = staff.Id,
                        BaseSalary = staff.Role == StaffRole.Trainer ? 30000 : 25000,
                        PTCommissionRate = 10,
                        RehabCommissionRate = 15,
                        CreatedOn = DateTime.UtcNow
                    };
                    await _billingRepository.AddPayrollRuleAsync(rule);
                    await _unitOfWork.SaveChangesAsync();
                }

                StaffPayoutLog? log = logs.FirstOrDefault(l => l.StaffId == staff.Id);

                decimal baseSalary = log != null ? log.BaseSalarySnapshot : rule.BaseSalary;
                decimal commissions = 0;
                string status = "Pending";
                DateTime? payoutDate = null;

                if (log != null)
                {
                    commissions = log.Commissions;
                    status = log.Status;
                    payoutDate = log.PayoutDate;
                }
                else
                {
                    IEnumerable<PTAssignment> assignments = await _staffRepository.GetAssignmentsByTrainerIdAsync(staff.Id);
                    List<Guid> activeMemberIds = assignments.Where(a => a.IsActive).Select(a => a.MemberId).ToList();

                    if (activeMemberIds.Count > 0)
                    {
                        IEnumerable<SaleTransaction> paidPTTransactions = transactions.Where(t => 
                            activeMemberIds.Contains(t.MemberId) && 
                            !t.PaymentMethod.StartsWith("Pending") &&
                            t.InventoryItem != null && 
                            (t.InventoryItem.Name.Contains("Personal Training") || t.InventoryItem.Name.Contains("PT")));

                        decimal totalPaidPT = paidPTTransactions.Sum(t => t.TotalAmount);
                        decimal ptCommissions = totalPaidPT * (rule.PTCommissionRate / 100m);

                        if (ptCommissions == 0)
                        {
                            ptCommissions = activeMemberIds.Count * 1500m * (rule.PTCommissionRate / 100m);
                        }

                        IEnumerable<SaleTransaction> paidRehabTransactions = transactions.Where(t => 
                            activeMemberIds.Contains(t.MemberId) && 
                            !t.PaymentMethod.StartsWith("Pending") &&
                            t.InventoryItem != null && 
                            (t.InventoryItem.Name.Contains("Rehab") || t.InventoryItem.Name.Contains("Therapy")));

                        decimal totalPaidRehab = paidRehabTransactions.Sum(t => t.TotalAmount);
                        decimal rehabCommissions = totalPaidRehab * (rule.RehabCommissionRate / 100m);
                        if (rehabCommissions == 0 && staff.Role.ToString().Contains("Rehab"))
                        {
                            rehabCommissions = activeMemberIds.Count * 1800m * (rule.RehabCommissionRate / 100m);
                        }

                        commissions = Math.Round(ptCommissions + rehabCommissions, 2);
                    }
                }

                string initials = $"{staff.FirstName[..1]}{staff.LastName[..1]}".ToUpper();

                payoutsList.Add(new StaffPayoutDto
                {
                    StaffId = staff.Id,
                    Id = $"PAY-{monthKey.Replace("-", "")}-{staff.Id.ToString()[..4].ToUpper()}",
                    StaffName = $"{staff.FirstName} {staff.LastName}",
                    Role = staff.Role.ToString(),
                    Email = staff.Email,
                    Initials = initials,
                    BaseSalary = baseSalary,
                    Commissions = commissions,
                    TotalPayout = baseSalary + commissions,
                    Status = status,
                    PTCommissionRate = rule.PTCommissionRate,
                    RehabCommissionRate = rule.RehabCommissionRate,
                    PayoutDate = payoutDate
                });
            }

            decimal totalBaseSalary = payoutsList.Sum(x => x.BaseSalary);
            decimal totalCommissions = payoutsList.Sum(x => x.Commissions);

            return new StaffPayrollOverviewDto
            {
                TotalBaseSalary = totalBaseSalary,
                TotalCommissions = totalCommissions,
                TotalPayout = totalBaseSalary + totalCommissions,
                StaffCount = payoutsList.Count,
                Payouts = payoutsList
            };
        }

        public async Task<bool> UpdateStaffPayrollRuleAsync(Guid gymId, UpdateStaffPayrollRuleRequest request)
        {
            StaffPayrollRule? rule = await _billingRepository.GetPayrollRuleByStaffIdAsync(request.StaffId);
            if (rule == null)
            {
                Staff? staff = await _staffRepository.GetByIdAsync(request.StaffId);
                if (staff == null) return false;

                rule = new StaffPayrollRule
                {
                    Id = Guid.NewGuid(),
                    GymId = gymId,
                    BranchId = staff.BranchId,
                    StaffId = request.StaffId,
                    BaseSalary = request.BaseSalary,
                    PTCommissionRate = request.PTCommissionRate,
                    RehabCommissionRate = request.RehabCommissionRate,
                    CreatedOn = DateTime.UtcNow
                };
                await _billingRepository.AddPayrollRuleAsync(rule);
            }
            else
            {
                rule.BaseSalary = request.BaseSalary;
                rule.PTCommissionRate = request.PTCommissionRate;
                rule.RehabCommissionRate = request.RehabCommissionRate;
                rule.ModifiedOn = DateTime.UtcNow;
            }

            int saved = await _unitOfWork.SaveChangesAsync();
            return saved > 0;
        }

        public async Task<bool> ReleaseStaffPayoutAsync(Guid gymId, Guid? branchId, ReleaseStaffPayoutRequest request)
        {
            StaffPayoutLog? log = await _billingRepository.GetPayoutLogAsync(request.StaffId, request.MonthKey);
            StaffPayrollRule? rule = await _billingRepository.GetPayrollRuleByStaffIdAsync(request.StaffId);
            if (rule == null) return false;

            if (log == null)
            {
                Staff? staff = await _staffRepository.GetByIdAsync(request.StaffId);
                if (staff == null) return false;

                log = new StaffPayoutLog
                {
                    Id = Guid.NewGuid(),
                    GymId = gymId,
                    BranchId = branchId ?? staff.BranchId,
                    StaffId = request.StaffId,
                    MonthKey = request.MonthKey,
                    BaseSalarySnapshot = rule.BaseSalary,
                    Commissions = request.Commissions,
                    TotalPayout = request.TotalPayout,
                    Status = request.Status,
                    PayoutDate = DateTime.UtcNow,
                    CreatedOn = DateTime.UtcNow
                };
                await _billingRepository.AddPayoutLogAsync(log);
            }
            else
            {
                log.Status = request.Status;
                log.PayoutDate = DateTime.UtcNow;
                log.ModifiedOn = DateTime.UtcNow;
            }

            int saved = await _unitOfWork.SaveChangesAsync();
            return saved > 0;
        }
    }
}
