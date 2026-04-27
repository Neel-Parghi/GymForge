using GymForge.Application.Modules.Users.Interface;
using GymForge.Contracts.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymForge.Api.Controllers.User
{
    [Route("api/users")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        
        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPost("invite-owner")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> InviteOwner(InviteOwnerRequestDto dto)
        {
            await _userService.InviteOwnerAsync(dto);
            return Ok(new { message = "Invitation sent successfully." });
        }

        [HttpGet("validate-invitation/{token}")]
        [AllowAnonymous]
        public async Task<IActionResult> ValidateInvitation(string token)
        {
            bool isValid = await _userService.ValidateInvitationTokenAsync(token);
            return Ok(new { isValid });
        }

        [HttpPost("set-password")]
        [AllowAnonymous]
        public async Task<IActionResult> SetPassword(SetPasswordRequestDto setPasswordRequestDto)
        {
            await _userService.SetPasswordAsync(setPasswordRequestDto);
            return Ok(new { message = "Password set successfully. You can now login." });
        }

        [HttpPost("re-invite/{userId}")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> ReInvite(Guid userId)
        {
            await _userService.ReInviteOwnerAsync(userId);
            return Ok(new { message = "Invitation re-sent successfully." });
        }

        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            UserProfileDto profile = await _userService.GetMyProfileAsync();
            return Ok(profile);
        }

        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserProfileDto dto)
        {
            await _userService.UpdateMyProfileAsync(dto);
            return Ok(new { Message = "Profile updated successfully" });
        }

        [HttpPut("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequestDto dto)
        {
            await _userService.ChangeMyPasswordAsync(dto);
            return Ok(new { Message = "Password changed successfully" });
        }

        [HttpPost("profile/upload-avatar")]
        [Authorize]
        public async Task<IActionResult> UploadAvatar(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
                return BadRequest("Invalid file type. Only JPG, PNG and GIF are allowed.");

            if (file.Length > 5 * 1024 * 1024)
                return BadRequest("File size exceeds 5MB limit.");

            string url = await _userService.UploadAvatarAsync(file);
            return Ok(new UploadAvatarResponseDto { Url = url, Message = "Profile picture updated successfully" });
        }
    }
}
