namespace GymForge.Contracts.Staff
{
    public class TrainerMemberResponse
    {
        public Guid MemberId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string MembershipNumber { get; set; } = string.Empty;
        public string? AssignedSlot { get; set; }
        public DateTime AssignedDate { get; set; }
    }
}
