namespace GymForge.Domain.Entities
{
    public class MemberMeasurement : BaseEntity
    {
        public Guid MemberId { get; set; }
        public Guid? RecordedById { get; set; }
        
        public double? Weight { get; set; }
        public double? Height { get; set; }
        public double? BodyFatPercentage { get; set; }
        public double? BMI { get; set; }
        
        public string? Notes { get; set; }
        public DateTime Date { get; set; }

        // Navigation
        public GymMember Member { get; set; } = null!;
        public Staff? RecordedBy { get; set; }
    }
}
