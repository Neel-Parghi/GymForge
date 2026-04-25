namespace GymForge.Contracts.SaaSPayments
{
    public class SaaSConfigurationDto
    {
        public Guid Id { get; set; }
        public string PlatformName { get; set; } = string.Empty;
        public string BillingEmail { get; set; } = string.Empty;
        public decimal TaxPercentage { get; set; }
        public int GracePeriodDays { get; set; }
        public string Currency { get; set; } = "INR";
        public string? BillingAddress { get; set; }
        public string? SupportPhone { get; set; }
    }
}
