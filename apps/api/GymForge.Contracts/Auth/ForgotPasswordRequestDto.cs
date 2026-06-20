using System.ComponentModel.DataAnnotations;

namespace GymForge.Contracts.Auth
{
    public class ForgotPasswordRequestDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string ClientUri { get; set; } = string.Empty;
    }
}
