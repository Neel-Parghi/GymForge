using GymForge.Application.Modules.Users.Interface;
using GymForge.Contracts.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymForge.Api.Controllers.User
{
    [Route("api/[controller]")]
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
    }
}
