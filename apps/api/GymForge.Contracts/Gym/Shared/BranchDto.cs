namespace GymForge.Contracts.Gym.Shared
{
    public class BranchDto
    {
        public string Name { get; set; } = null!;
        public string? ContactNumber { get; set; }
        public string? OpenTime { get; set; }
        public string? CloseTime { get; set; }

        public AddressDto Address { get; set; } = null!;
    }
}
