using GymForge.Api.Middlewares;
using GymForge.Application.Modules.Gym.Interfaces;
using GymForge.Contracts.Members;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymForge.Api.Controllers.Members
{
    [Route("api/members")]
    [Authorize(Roles = "GymOwner")]
    public class MembersController : BaseApiController
    {
        private readonly IGymMemberService _memberService;

        public MembersController(IGymMemberService memberService)
        {
            _memberService = memberService;
        }

        [HttpPost("~/api/gyms/{gymId}/members")]
        public async Task<ActionResult> OnboardMember(Guid gymId, [FromBody] OnboardMemberRequest request)
        {
            try
            {
                GymMemberResponse response = await _memberService.OnboardMemberAsync(gymId, request, UserId);
                return Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("~/api/gyms/{gymId}/members")]
        public async Task<ActionResult> GetGymMembers(Guid gymId)
        {
            return Ok(await _memberService.GetGymMembersAsync(gymId));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetMemberById(Guid id)
        {
            GymMemberResponse? member = await _memberService.GetMemberByIdAsync(id);
            if (member == null) return NotFound();
            return Ok(member);
        }
        
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateMember(Guid id, [FromBody] OnboardMemberRequest request)
        {
            try
            {
                GymMemberResponse response = await _memberService.UpdateMemberAsync(id, request, UserId);
                return Ok(response);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPatch("{id}/status/toggle")]
        public async Task<ActionResult> ToggleMemberStatus(Guid id)
        {
            bool success = await _memberService.ToggleMemberStatusAsync(id);
            if (!success) return NotFound();
            return Ok(new { success = true });
        }

        [HttpPatch("{id}/status/freeze")]
        public async Task<ActionResult> FreezeMember(Guid id)
        {
            bool success = await _memberService.FreezeMemberAsync(id, UserId);
            if (!success) return NotFound();
            return Ok(new { success = true });
        }

        [HttpPatch("{id}/status/unfreeze")]
        public async Task<ActionResult> UnfreezeMember(Guid id)
        {
            bool success = await _memberService.UnfreezeMemberAsync(id, UserId);
            if (!success) return NotFound();
            return Ok(new { success = true });
        }

        [HttpPost("{id}/subscriptions")]
        public async Task<ActionResult> RenewSubscription(Guid id, [FromBody] RenewSubscriptionRequest request)
        {
            try
            {
                GymMemberResponse response = await _memberService.RenewSubscriptionAsync(id, request, UserId);
                return Ok(response);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteMember(Guid id)
        {
            bool success = await _memberService.DeleteMemberAsync(id);
            if (!success) return NotFound();
            return Ok(new { success = true });
        }

        [HttpGet("{id}/subscriptions")]
        public async Task<ActionResult> GetSubscriptionHistory(Guid id)
        {
            return Ok(await _memberService.GetSubscriptionHistoryAsync(id));
        }

        [HttpGet("~/api/gyms/{gymId}/members/export")]
        [SkipResponseWrapper]
        public async Task<IActionResult> ExportMembers(Guid gymId)
        {
            byte[] bytes = await _memberService.ExportMembersAsync(gymId);
            return File(bytes, "text/csv", $"Members_Export_{DateTime.UtcNow:yyyyMMdd}.csv");
        }
    }
}
