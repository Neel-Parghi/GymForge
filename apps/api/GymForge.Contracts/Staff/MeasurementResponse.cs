namespace GymForge.Contracts.Staff
{
    public class MeasurementResponse
    {
        public Guid Id { get; set; }
        public double? Weight { get; set; }
        public double? Height { get; set; }
        public double? BodyFatPercentage { get; set; }
        public double? BMI { get; set; }
        public string? Notes { get; set; }
        public DateTime Date { get; set; }
        public string? RecordedBy { get; set; }
    }
}
