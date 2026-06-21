using GymForge.Application.Modules.Gym.Interfaces;
using GymForge.Application.Modules.Users.Interface;
using GymForge.Contracts.Common;
using GymForge.Contracts.Members;
using GymForge.Contracts.Users;
using GymForge.Shared.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymForge.Api.Controllers.User
{
    [Route("api/users")]
    [ApiController]
    public class UserController : BaseApiController
    {
        private readonly IUserService _userService;
        private readonly IGymMemberService _memberService;
        
        public UserController(IUserService userService, IGymMemberService memberService)
        {
            _userService = userService;
            _memberService = memberService;
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

            string[] allowedExtensions = [".jpg", ".jpeg", ".png", ".gif"];
            string extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
                return BadRequest("Invalid file type. Only JPG, PNG and GIF are allowed.");

            if (file.Length > 25 * 1024 * 1024)
                return BadRequest("File size exceeds 25MB limit.");

            string url = await _userService.UploadAvatarAsync(file);
            return Ok(new UploadAvatarResponseDto { Url = url, Message = "Profile picture updated successfully" });
        }

        [HttpGet("my-subscriptions")]
        [Authorize]
        public async Task<IActionResult> GetMySubscriptions()
        {
            var subscriptions = await _memberService.GetSubscriptionHistoryByUserIdAsync(UserId);
            return Ok(subscriptions);
        }

        [HttpGet("my-gym")]
        [Authorize]
        public async Task<IActionResult> GetMyGym()
        {
            MyGymMembershipResponse? myGymMembership = await _memberService.GetMyGymMembershipAsync(UserId);
            if (myGymMembership == null)
            {
                return Ok(null);
            }
            return Ok(myGymMembership);
        }

        [HttpGet("deletion-requests")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> GetDeletionRequests()
        {
            IEnumerable<DeletionRequestDto> requests = await _userService.GetPendingDeletionRequestsAsync();
            return Ok(requests);
        }

        [HttpGet("standalone")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> GetStandaloneUsers([FromQuery] PaginationParams pagination)
        {
            PagedResponse<StandaloneUserDto> users = await _userService.GetStandaloneUsersAsync(pagination);
            
            return Ok(new ApiResponse<PagedResponse<StandaloneUserDto>> 
            {
                Data = users,
                Message = "Standalone users retrieved successfully",
                Success = true
            });
        }

        [HttpPost("save-onboarding-step/{step}")]
        [Authorize]
        public async Task<IActionResult> SaveOnboardingStep(int step)
        {
            await _userService.SaveOnboardingStepAsync(UserId, step);
            return Ok(new { Message = "Onboarding step saved successfully" });
        }

        [HttpPost("complete-user-onboarding")]
        [Authorize(Roles = "Member,User")]
        public async Task<IActionResult> CompleteUserOnboarding([FromBody] CompleteUserOnboardingDto dto)
        {
            await _userService.CompleteUserOnboardingAsync(UserId, dto);
            return Ok(new { Message = "User onboarding completed successfully" });
        }
    }
}
