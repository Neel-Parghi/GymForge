using GymForge.Domain.Enums;

namespace GymForge.Domain.Entities
{
    public class User : BaseEntity
    {
        public string FirstName { get; set; } = string.Empty;
        
        public string LastName { get; set; } = string.Empty;
        
        public string Email { get; set; } = string.Empty;
        
        public string Phone { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;

        public Guid? GymId { get; set; }

        public Guid? AddressId { get; set; }
        
        public string ProfilePictureUrl { get; set; } = string.Empty;

        public UserRole Role { get; set; }

        public bool IsActive { get; set; }

        public Address? Address { get; set; }

        public ICollection<Gym>? Gyms { get; set; } = [];

    }
}
