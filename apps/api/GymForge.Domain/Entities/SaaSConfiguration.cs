using System.ComponentModel.DataAnnotations;

namespace GymForge.Domain.Entities
{
    public class SaaSConfiguration : BaseEntity
    {
        [Required]
        [MaxLength(100)]
        public string PlatformName { get; set; } = "GymForge";

        [Required]
        [EmailAddress]
        public string BillingEmail { get; set; } = string.Empty;

        public decimal TaxPercentage { get; set; } = 18.0m;

        public int GracePeriodDays { get; set; } = 7;

        public string Currency { get; set; } = "INR";

        public string? BillingAddress { get; set; }
        
        public string? SupportPhone { get; set; }
    }
}
