using GymForge.Application.Modules.Gym.Interfaces;
using GymForge.Contracts.Members;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymForge.Api.Controllers.Members
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "GymOwner")]
    public class MembersController : ControllerBase
    {
        private readonly IGymMemberService _memberService;

        public MembersController(IGymMemberService memberService)
        {
            _memberService = memberService;
        }

        [HttpPost("onboard/{gymId}/{createdBy}")]
        public async Task<ActionResult> OnboardMember(Guid gymId, Guid createdBy, [FromBody] OnboardMemberRequest request)
        {
            try
            {
                GymMemberResponse response = await _memberService.OnboardMemberAsync(gymId, request, createdBy);
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

        [HttpGet("gym/{gymId}")]
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
        
        [HttpPut("{id}/{updatedBy}")]
        public async Task<ActionResult> UpdateMember(Guid id, Guid updatedBy, [FromBody] OnboardMemberRequest request)
        {
            try
            {
                GymMemberResponse response = await _memberService.UpdateMemberAsync(id, request, updatedBy);
                return Ok(response);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPut("{id}/toggle-status")]
        public async Task<ActionResult> ToggleMemberStatus(Guid id)
        {
            bool success = await _memberService.ToggleMemberStatusAsync(id);
            if (!success) return NotFound();
            return Ok(new { success = true });
        }

        [HttpPut("{id}/freeze/{updatedBy}")]
        public async Task<ActionResult> FreezeMember(Guid id, Guid updatedBy)
        {
            bool success = await _memberService.FreezeMemberAsync(id, updatedBy);
            if (!success) return NotFound();
            return Ok(new { success = true });
        }

        [HttpPut("{id}/unfreeze/{updatedBy}")]
        public async Task<ActionResult> UnfreezeMember(Guid id, Guid updatedBy)
        {
            bool success = await _memberService.UnfreezeMemberAsync(id, updatedBy);
            if (!success) return NotFound();
            return Ok(new { success = true });
        }

        [HttpPost("{id}/renew/{updatedBy}")]
        public async Task<ActionResult> RenewSubscription(Guid id, Guid updatedBy, [FromBody] RenewSubscriptionRequest request)
        {
            try
            {
                GymMemberResponse response = await _memberService.RenewSubscriptionAsync(id, request, updatedBy);
                return Ok(response);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}
