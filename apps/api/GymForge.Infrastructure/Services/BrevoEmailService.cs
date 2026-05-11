using GymForge.Domain.Interface;
using Microsoft.Extensions.Configuration;
using System.Net.Http.Json;

namespace GymForge.Infrastructure.Services
{
    public class BrevoEmailService : IEmailService
    {
        private readonly IConfiguration _config;
        private readonly HttpClient _httpClient;

        public BrevoEmailService(IConfiguration config, HttpClient httpClient)
        {
            _config = config;
            _httpClient = httpClient;
        }

        public async Task SendInvitationEmailAsync(string email, string name, string token)
        {
            try
            {
                string apiKey = _config["Brevo:RestApiKey"] ?? throw new Exception("Brevo REST API Key (RestApiKey) is missing.");
                string fromEmail = _config["Brevo:FromEmail"] ?? throw new Exception("Brevo FromEmail is missing.");
                string fromName = _config["Brevo:FromName"] ?? throw new Exception("Brevo FromName is missing.");
                string baseUrl = _config["GymForge:BaseUrl"] ?? throw new Exception("GymForge BaseUrl is missing.");

                string inviteLink = $"{baseUrl}/accept-invitation?token={Uri.EscapeDataString(token)}";

                var payload = new
                {
                    sender = new { name = fromName, email = fromEmail },
                    to = new[] { new { name = name, email = email } },
                    subject = "Invitation to Join GymForge",
                    htmlContent = $"<strong>Hello {name},</strong><br><br>Please click <a href='{inviteLink}'>here</a> to set your password and join GymForge."
                };

                using HttpRequestMessage request = new(HttpMethod.Post, "https://api.brevo.com/v3/smtp/email");
                request.Headers.Add("api-key", apiKey);
                request.Content = JsonContent.Create(payload);

                HttpResponseMessage response = await _httpClient.SendAsync(request);

                if (!response.IsSuccessStatusCode)
                {
                    string errorDetail = await response.Content.ReadAsStringAsync();
                    throw new Exception($"Brevo API error: {response.StatusCode} - {errorDetail}");
                }
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while sending the invitation email via Brevo REST API.", ex);
            }
        }

        public async Task SendEmailAsync(string email, string name, string subject, string htmlContent)
        {
            try
            {
                string apiKey = _config["Brevo:RestApiKey"] ?? throw new Exception("Brevo REST API Key is missing.");
                string fromEmail = _config["Brevo:FromEmail"] ?? throw new Exception("Brevo FromEmail is missing.");
                string fromName = _config["Brevo:FromName"] ?? throw new Exception("Brevo FromName is missing.");

                var payload = new
                {
                    sender = new { name = fromName, email = fromEmail },
                    to = new[] { new { name = name, email = email } },
                    subject = subject,
                    htmlContent = htmlContent
                };

                using HttpRequestMessage request = new(HttpMethod.Post, "https://api.brevo.com/v3/smtp/email");
                request.Headers.Add("api-key", apiKey);
                request.Content = JsonContent.Create(payload);

                HttpResponseMessage response = await _httpClient.SendAsync(request);

                if (!response.IsSuccessStatusCode)
                {
                    string errorDetail = await response.Content.ReadAsStringAsync();
                    throw new Exception($"Brevo API error: {response.StatusCode} - {errorDetail}");
                }
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while sending the email via Brevo.", ex);
            }
        }

        public async Task SendReceiptEmailAsync(string email, string name, string transactionId, string amount, string productName, string date)
        {
            string htmlContent = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;'>
                    <h2 style='color: #2563eb; text-align: center;'>GymForge Payment Receipt</h2>
                    <p>Hello <strong>{name}</strong>,</p>
                    <p>Thank you for your purchase. Here are your transaction details:</p>
                    <div style='background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;'>
                        <table style='width: 100%; border-collapse: collapse;'>
                            <tr><td style='padding: 8px 0; color: #6b7280;'>Transaction ID:</td><td style='text-align: right; font-weight: bold;'>#{transactionId}</td></tr>
                            <tr><td style='padding: 8px 0; color: #6b7280;'>Product:</td><td style='text-align: right; font-weight: bold;'>{productName}</td></tr>
                            <tr><td style='padding: 8px 0; color: #6b7280;'>Amount Paid:</td><td style='text-align: right; font-weight: bold; color: #10b981;'>₹{amount}</td></tr>
                            <tr><td style='padding: 8px 0; color: #6b7280;'>Date:</td><td style='text-align: right;'>{date}</td></tr>
                        </table>
                    </div>
                    <p style='text-align: center; color: #9ca3af; font-size: 0.875rem;'>This is an automated receipt. No signature required.</p>
                </div>";

            await SendEmailAsync(email, name, $"Receipt for your purchase: {productName}", htmlContent);
        }
    }
}
