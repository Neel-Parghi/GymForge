namespace GymForge.Contracts.Staff
{
    public class AddMeasurementRequest
    {
        public double? Weight { get; set; }
        public double? Height { get; set; }
        public double? BodyFatPercentage { get; set; }
        public double? BMI { get; set; }
        public string? Notes { get; set; }
    }
}
