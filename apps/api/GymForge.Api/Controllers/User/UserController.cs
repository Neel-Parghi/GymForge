using GymForge.Application.Modules.Users.Interface;
using GymForge.Application.Common.Interfaces;
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
        private readonly ICurrentUserService _currentUserService;

        public UserController(IUserService userService, ICurrentUserService currentUserService)
        {
            _userService = userService;
            _currentUserService = currentUserService;
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
            UserProfileDto profile = await _userService.GetUserProfileAsync(_currentUserService.UserId.Value);
            return Ok(profile);
        }

        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserProfileDto dto)
        {
            await _userService.UpdateUserProfileAsync(_currentUserService.UserId.Value, dto);
            return Ok(new { Message = "Profile updated successfully" });
        }

        [HttpPut("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequestDto dto)
        {
            await _userService.ChangePasswordAsync(_currentUserService.UserId.Value, dto);
            return Ok(new { Message = "Password changed successfully" });
        }
    }
}
