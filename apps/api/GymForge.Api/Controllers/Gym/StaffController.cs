using GymForge.Application.Modules.Gym.Interfaces;
using GymForge.Contracts.Common;
using GymForge.Contracts.Staff;
using GymForge.Shared.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymForge.Api.Controllers.Gym
{
    [Route("api/staff")]
    [Authorize(Roles = "GymOwner,Staff")]
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
                if (!User.IsInRole("GymOwner"))
                {
                    request.BranchId = SecureBranchId;
                }

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
            return Ok(await _staffService.GetGymStaffAsync(GymId.Value, pagination, SecureBranchId));
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
                if (!User.IsInRole("GymOwner"))
                {
                    request.BranchId = SecureBranchId;
                }

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
        public async Task<ActionResult> AssignTrainerToMember(Guid id, Guid memberId, [FromQuery] string? slot, [FromQuery] int? durationDays)
        {
            await _staffService.AssignTrainerToMemberAsync(id, memberId, slot, durationDays);
            return Ok(new { message = "Trainer assigned successfully" });
        }

        [HttpPost("{id}/deallocate-member/{memberId}")]
        public async Task<ActionResult> DeallocateTrainerFromMember(Guid id, Guid memberId)
        {
            await _staffService.DeallocateMemberFromTrainerAsync(id, memberId);
            return Ok(new { message = "Member deallocated from trainer successfully" });
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

        [HttpPost("{id}/check-in")]
        public async Task<ActionResult> CheckInStaff(Guid id, [FromBody] StaffCheckInRequest request)
        {
            if (GymId == null) return Unauthorized();
            try
            {
                StaffResponse response = await _staffService.CheckInStaffAsync(id, GymId.Value, SecureBranchId, request.Notes);
                return Ok(response);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{id}/check-out")]
        public async Task<ActionResult> CheckOutStaff(Guid id)
        {
            if (GymId == null) return Unauthorized();
            try
            {
                StaffResponse response = await _staffService.CheckOutStaffAsync(id, GymId.Value, SecureBranchId);
                return Ok(response);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("attendance-logs")]
        public async Task<ActionResult> GetStaffAttendanceLogs([FromQuery] PaginationParams pagination)
        {
            if (GymId == null) return Unauthorized();
            
            if (pagination.BypassPagination == true)
            {
                IEnumerable<StaffAttendanceLogResponse> allLogs = await _staffService.GetStaffAttendanceLogsAsync(GymId.Value, SecureBranchId);
                return Ok(allLogs);
            }
            
            PagedResponse<StaffAttendanceLogResponse> pagedLogs = await _staffService.GetStaffAttendanceLogsPagedAsync(GymId.Value, pagination, SecureBranchId);
            return Ok(pagedLogs);
        }
    }
}
