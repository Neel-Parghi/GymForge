using GymForge.Shared.Enums;

namespace GymForge.Contracts.Members
{
    public record RenewSubscriptionRequest(
        Guid GymPlanId,
        DateTime? StartDate = null,
        PaymentStatus? PaymentStatus = null
    );
}
