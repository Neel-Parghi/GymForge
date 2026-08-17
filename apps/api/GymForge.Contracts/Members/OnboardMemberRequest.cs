using GymForge.Contracts.Gym.Shared;
using GymForge.Shared.Enums;

namespace GymForge.Contracts.Members
{
    public record OnboardMemberRequest(
        string FirstName,
        string LastName,
        string Email,
        string PhoneNumber,
        DateTime DateOfBirth,
        Gender Gender,
        string? EmergencyContactName,
        string? EmergencyContactPhone,
        string? BloodGroup,
        AddressDto? Address,
        string? MedicalConditions,
        List<string>? FitnessGoals,
        Guid GymPlanId,
        DateTime? StartDate = null,
        PaymentStatus? PaymentStatus = null,
        Guid? BranchId = null,
        decimal? AmountPaid = null
    );
}
