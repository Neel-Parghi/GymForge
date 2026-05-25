using GymForge.Contracts.Gym.Billing;

namespace GymForge.Application.Modules.Gym.Interfaces
{
    public interface IMemberBillingService
    {
        Task<MemberBillingOverviewDto> GetMemberBillingOverviewAsync(Guid gymId, Guid? branchId, string monthKey);
        Task<bool> CreateCustomInvoiceAsync(Guid gymId, Guid? branchId, CreateCustomInvoiceRequest request);
        Task<bool> MarkAsPaidAsync(Guid gymId, Guid recordId);
    }
}
