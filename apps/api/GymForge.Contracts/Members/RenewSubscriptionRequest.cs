namespace GymForge.Contracts.Members
{
    public record RenewSubscriptionRequest(
        Guid GymPlanId,
        DateTime? StartDate = null
    );
}
