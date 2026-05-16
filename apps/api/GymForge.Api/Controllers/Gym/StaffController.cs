using GymForge.Application.Modules.Gym.Interfaces;
using GymForge.Contracts.Common;
using GymForge.Contracts.Staff;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymForge.Api.Controllers.Gym
{
    [Route("api/staff")]
    [Authorize(Roles = "GymOwner")]
    public class StaffController : BaseApiController
    {
        private readonly IStaffService _staffService;

        public StaffController(IStaffService staffService)
        {
            _staffService = staffService;
        }

        [HttpPost]
        public async Task<ActionResult> AddStaff([FromBody] AddStaffRequest request)
        {
            if (GymId == null) return Unauthorized();
            try
            {
                StaffResponse response = await _staffService.AddStaffAsync(GymId.Value, request);
                return Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet]
        public async Task<ActionResult> GetGymStaff([FromQuery] PaginationParams pagination)
        {
            if (GymId == null) return Unauthorized();
            return Ok(await _staffService.GetGymStaffAsync(GymId.Value, pagination));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetStaffById(Guid id)
        {
            StaffResponse? staff = await _staffService.GetStaffByIdAsync(id);
            if (staff == null) return NotFound();
            return Ok(staff);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateStaff(Guid id, [FromBody] AddStaffRequest request)
        {
            try
            {
                await _staffService.UpdateStaffAsync(id, request);
                return Ok(new { message = "Staff updated successfully" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteStaff(Guid id)
        {
            await _staffService.DeleteStaffAsync(id);
            return Ok(new { message = "Staff deleted successfully" });
        }

        [HttpPost("{id}/assign-member/{memberId}")]
        public async Task<ActionResult> AssignTrainerToMember(Guid id, Guid memberId, [FromQuery] string? slot)
        {
            await _staffService.AssignTrainerToMemberAsync(id, memberId, slot);
            return Ok(new { message = "Trainer assigned successfully" });
        }

        [HttpGet("{id}/members")]
        public async Task<ActionResult> GetAssignedMembers(Guid id)
        {
            return Ok(await _staffService.GetAssignedMembersAsync(id));
        }

        [HttpPost("~/api/members/{memberId}/measurements")]
        public async Task<ActionResult> RecordMeasurement(Guid memberId, [FromBody] AddMeasurementRequest request)
        {
            await _staffService.RecordMeasurementAsync(memberId, UserId, request);
            return Ok(new { message = "Measurement recorded successfully" });
        }

        [HttpGet("~/api/members/{memberId}/measurements")]
        public async Task<ActionResult> GetMemberMeasurements(Guid memberId)
        {
            return Ok(await _staffService.GetMemberMeasurementsAsync(memberId));
        }
    }
}
