namespace GymForge.Contracts.SaaSPayments
{
    public class InitiatePaymentResponseDto
    {
        public Guid TransactionId { get; set; }
        public string RazorpayOrderId { get; set; } = string.Empty;
    }
}
