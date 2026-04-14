namespace GymForge.Contracts.Gym
{
    public class GymOwnersDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public int GymsOwned { get; set; }
        public string Location { get; set; } = string.Empty;
        public DateTime JoinedDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string InvitationStatus { get; set; } = string.Empty;

    }
}
