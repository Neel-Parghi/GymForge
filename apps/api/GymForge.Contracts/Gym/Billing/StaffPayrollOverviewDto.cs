using System.Collections.Generic;

namespace GymForge.Contracts.Gym.Billing
{
    public class StaffPayrollOverviewDto
    {
        public decimal TotalBaseSalary { get; set; }
        public decimal TotalCommissions { get; set; }
        public decimal TotalPayout { get; set; }
        public int StaffCount { get; set; }
        public List<StaffPayoutDto> Payouts { get; set; } = new();
    }
}
