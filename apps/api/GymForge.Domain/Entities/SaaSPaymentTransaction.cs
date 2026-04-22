namespace GymForge.Domain.Entities
{
    public class SaaSPaymentTransaction : BaseEntity
    {
        public Guid GymId { get; set; }

        public Guid SubscriptionId { get; set; }

        public decimal Amount { get; set; }

        public string Currency { get; set; } = "INR";

        public string Status { get; set; } = "Pending";

        public string GatewayTransactionId { get; set; } = string.Empty;

        public string? GatewayResponse { get; set; }
        public string? FailureReason { get; set; }

        public Gym Gym { get; set; } = null!;
        public GymSubscription Subscription { get; set; } = null!;
    }
}
