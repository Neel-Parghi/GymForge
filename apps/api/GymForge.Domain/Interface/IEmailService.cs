namespace GymForge.Domain.Interface
{
    public interface IEmailService
    {
        Task SendInvitationEmailAsync(string email, string name, string token);
        Task SendEmailAsync(string email, string name, string subject, string htmlContent);
        Task SendReceiptEmailAsync(string email, string name, string transactionId, string amount, string productName, string date);
    }
}
