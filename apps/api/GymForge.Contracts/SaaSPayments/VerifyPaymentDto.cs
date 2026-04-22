namespace GymForge.Contracts.SaaSPayments
{
    public class VerifyPaymentDto
    {
        public string OrderId { get; set; } = string.Empty;
        public string PaymentId { get; set; } = string.Empty;
        public string? GatewayResponse { get; set; }
    }
}
