using GymForge.Shared.Enums;

namespace GymForge.Domain.Entities
{
    public class GymMember: BaseEntity
    {
        public Guid GymId { get; set; }
        public string MembershipNumber { get; set; } = string.Empty;

        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;

        public Guid? UserId { get; set; }
        public User? User { get; set; }

        public DateTime DateOfBirth { get; set; }
        public Gender Gender { get; set; }
        public string? ProfilePictureUrl { get; set; }

        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactPhone { get; set; }

        public string? BloodGroup { get; set; }
        public Guid? AddressId { get; set; }
        public Address? Address { get; set; }
        public string? MedicalConditions { get; set; }
        public List<string>? FitnessGoals { get; set; }

        public DateTime JoiningDate { get; set; }
        public MemberStatus Status { get; set; } 

        public Gym Gym { get; set; } = null!;
        public ICollection<MemberSubscription> Subscriptions { get; set; } = new List<MemberSubscription>();
        public ICollection<MemberMeasurement> Measurements { get; set; } = new List<MemberMeasurement>();
    }
}
