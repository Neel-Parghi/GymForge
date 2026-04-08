namespace GymForge.Contracts.Gym
{
    public class BranchDto
    {
        public string Name { get; set; } = null!;
        public string? ContactNumber { get; set; }

        public AddressDto Address { get; set; } = null!;
    }
}
