using GymForge.Domain.Interface;
using Microsoft.Extensions.Configuration;
using System.Net.Http.Json;
using System.Text.Json;

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

                using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.brevo.com/v3/smtp/email");
                request.Headers.Add("api-key", apiKey);
                request.Content = JsonContent.Create(payload);

                var response = await _httpClient.SendAsync(request);

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
    }
}
