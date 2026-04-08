namespace GymForge.Contracts.Gym
{
    public class GymOnboardingDto
    {
        public string Name { get; set; } = null!;
        public string? BrandName { get; set; }
        public string? Description { get; set; }
        public DateTime? EstablishedDate { get; set; }

        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? WebsiteUrl { get; set; }

        public string? GstNumber { get; set; }
        public string? RegistrationNumber { get; set; }

        public string? LogoUrl { get; set; }
        public string? CoverImageUrl { get; set; }

        public AddressDto Address { get; set; } = null!;

        public OwnerDto Owner { get; set; } = null!;

        public BranchDto Branch { get; set; } = null!;

        public Guid PlanId { get; set; }
        public bool IsTrial { get; set; }
    }
}
