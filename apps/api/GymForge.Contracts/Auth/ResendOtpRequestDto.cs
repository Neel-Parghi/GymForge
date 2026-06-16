using System.ComponentModel.DataAnnotations;

namespace GymForge.Contracts.Auth
{
    public class ResendOtpRequestDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }
}
