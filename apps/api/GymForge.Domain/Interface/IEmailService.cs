namespace GymForge.Domain.Interface
{
    public interface IEmailService
    {
        Task SendInvitationEmailAsync(string email, string name, string token);
    }

}
