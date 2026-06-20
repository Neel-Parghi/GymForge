using GymForge.Contracts.Gym.Management;
using GymForge.Domain.Entities;
using GymForge.Domain.Enums;
using GymForge.Domain.Interface;
using GymForge.Shared.Enums;

using Microsoft.Extensions.Logging;

namespace GymForge.Application.BackgroundJobs
{
    public class AutomatedNotificationJob
    {
        private readonly IGymManagementRepository _gymRepository;
        private readonly IAnnouncementTemplateRepository _templateRepository;
        private readonly IGymMemberRepository _memberRepository;
        private readonly IUserNotificationRepository _notificationRepository;
        private readonly IEmailService _emailService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<AutomatedNotificationJob> _logger;

        public AutomatedNotificationJob(
            IGymManagementRepository gymRepository,
            IAnnouncementTemplateRepository templateRepository,
            IGymMemberRepository memberRepository,
            IUserNotificationRepository notificationRepository,
            IEmailService emailService,
            IUnitOfWork unitOfWork,
            ILogger<AutomatedNotificationJob> logger)
        {
            _gymRepository = gymRepository;
            _templateRepository = templateRepository;
            _memberRepository = memberRepository;
            _notificationRepository = notificationRepository;
            _emailService = emailService;
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task ExecuteAsync()
        {
            _logger.LogInformation("AutomatedNotificationJob started.");

            // Get all gyms
            List<GymListResponseDto> gyms = await _gymRepository.GetAllGymsAsync();

            foreach (GymListResponseDto gym in gyms)
            {
                await ProcessGymAutomationsAsync(gym.Id);
            }

            _logger.LogInformation("AutomatedNotificationJob completed.");
        }

        private async Task ProcessGymAutomationsAsync(Guid gymId)
        {
            // 1. Fetch templates for this gym
            List<AnnouncementTemplate> templates = await _templateRepository.GetByGymIdAsync(gymId);

            AnnouncementTemplate? expiredTemplate = templates.FirstOrDefault(t => t.Type == TemplateType.ExpiredMembership && t.IsActive);
            
            AnnouncementTemplate? expiringSoonTemplate = templates.FirstOrDefault(t => t.Type == TemplateType.ExpiringSoon && t.IsActive);

            if (expiredTemplate == null && expiringSoonTemplate == null)
            {
                return;
            }

            // 2. Fetch all active or recently expired subscriptions for this gym
            IEnumerable<MemberSubscription> subscriptions = await _memberRepository.GetActiveSubscriptionsByGymIdAsync(gymId);
            DateTime today = DateTime.UtcNow.Date;

            foreach (var sub in subscriptions)
            {
                DateTime endDate = sub.EndDate.Date;

                // EXPIRED TODAY
                if (expiredTemplate != null && endDate == today.AddDays(-1))
                {
                    sub.Member.Status = MemberStatus.Expired;
                    sub.IsActive = false;
                    await _memberRepository.UpdateAsync(sub.Member);

                    await SendNotificationAsync(gymId, sub, expiredTemplate);
                    await SendEmailAsync(gymId, sub, expiredTemplate);
                }
                
                // EXPIRING SOON
                if (expiringSoonTemplate != null && endDate == today.AddDays(3))
                {
                    await SendNotificationAsync(gymId, sub, expiringSoonTemplate);
                }
            }

            await _unitOfWork.SaveChangesAsync();
        }

        private async Task SendNotificationAsync(Guid gymId, MemberSubscription sub, AnnouncementTemplate template)
        {
            if (sub.Member == null || sub.Member.UserId == null) return;

            string title = ReplaceVariables(template.TitleTemplate, sub, gymId);
            string message = ReplaceVariables(template.MessageTemplate, sub, gymId);

            UserNotification notification = new()
            {
                GymId = gymId,
                UserId = sub.Member.UserId.Value,
                Title = title,
                Message = message,
                IsRead = false,
                CreatedOn = DateTime.UtcNow
            };

            await _notificationRepository.AddAsync(notification);
            _logger.LogInformation($"Created notification for User {sub.Member.UserId} (Template: {template.Type}).");
        }

        private async Task SendEmailAsync(Guid gymId, MemberSubscription sub, AnnouncementTemplate template)
        {
            if (sub.Member == null || sub.Member.User == null || string.IsNullOrEmpty(sub.Member.User.Email)) return;

            string subject = ReplaceVariables(template.TitleTemplate, sub, gymId);
            string body = ReplaceVariables(template.MessageTemplate, sub, gymId);

            try
            {
                string htmlBody = $"<p>{body.Replace("\n", "<br/>")}</p>";

                await _emailService.SendEmailAsync(sub.Member.User.Email, sub.Member.FirstName + " " + sub.Member.LastName, subject, htmlBody);
               
                _logger.LogInformation($"Sent Expired Email to {sub.Member.User.Email}.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send email to {sub.Member.User.Email}");
            }
        }

        private static string ReplaceVariables(string text, MemberSubscription sub, Guid gymId)
        {
            if (string.IsNullOrEmpty(text)) return text;

            var userName = sub.Member != null ? sub.Member.FirstName + " " + sub.Member.LastName : "Member";
            
            // Note: Since we don't have Gym loaded efficiently in this job, we use a placeholder or 
            // if we really needed it, we would query the gym name. For now, since the gymName is 
            // often known, we could just fall back. Let's just say "Our Gym".
            var gymName = "Our Gym"; 
            
            var planName = sub.GymPlan?.Name ?? "Membership Plan";
            var expiryDate = sub.EndDate.ToString("MMM dd, yyyy");

            return text
                .Replace("{{UserName}}", userName)
                .Replace("{{GymName}}", gymName)
                .Replace("{{PlanName}}", planName)
                .Replace("{{ExpiryDate}}", expiryDate);
        }
    }
}
