using System.ComponentModel.DataAnnotations.Schema;

namespace GymForge.Domain.Entities
{
    public class Gym : BaseEntity
    {
        public string GymName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;
        
        public string Phone { get; set; } = string.Empty;
        
        public Guid OwnerUserId { get; set; }

        public Guid AddressId { get; set; }

        public string LogoUrl { get; set; } = string.Empty;

        public string BannerUrl { get; set; } = string.Empty;

        public string Description {  get; set; } = string.Empty;

        public bool IsActive { get; set; }

        [ForeignKey(nameof(OwnerUserId))]
        public User? Owner { get; set; }

        public Address? Address { get; set; }
    }
}
