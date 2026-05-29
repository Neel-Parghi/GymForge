using GymForge.Application.Modules.Gym.Interfaces;
using GymForge.Contracts.Gym.Management;
using GymForge.Contracts.Gym.Shared;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymForge.Api.Controllers.Gym
{
    [Route("api/my-gym")]
    [Authorize] // Allow all authenticated roles to query tenant configurations
    [ApiController]
    public class MyGymController : BaseApiController
    {
        private readonly IGymManagementService _gymManagementService;

        public MyGymController(IGymManagementService gymManagementService)
        {
            _gymManagementService = gymManagementService;
        }

        [HttpGet]
        public async Task<IActionResult> GetMyGym()
        {
            GymListResponseDto? gym = await _gymManagementService.GetGymByOwnerIdAsync(UserId);
            if (gym == null) return NotFound("Gym not found for this owner.");
            return Ok(gym);
        }

        [Authorize(Roles = "GymOwner")]
        [HttpPut]
        public async Task<IActionResult> UpdateMyGym([FromBody] GymForge.Contracts.Gym.Owners.UpdateMyGymDto updateDto)
        {
            await _gymManagementService.UpdateMyGymAsync(UserId, updateDto);
            return Ok(new { message = "Gym profile updated successfully." });
        }

        [HttpGet("branches")]
        public async Task<IActionResult> GetMyBranches()
        {
            GymListResponseDto? gym = await _gymManagementService.GetGymByOwnerIdAsync(UserId);
            if (gym == null) return NotFound("Gym not found for this owner.");

            List<BranchDto> branches = await _gymManagementService.GetBranchesByGymIdAsync(gym.Id);
            return Ok(branches);
        }

        [Authorize(Roles = "GymOwner")]
        [HttpPost("branches")]
        public async Task<IActionResult> AddMyBranch([FromBody] BranchDto branchDto)
        {
            GymListResponseDto? gym = await _gymManagementService.GetGymByOwnerIdAsync(UserId);
            if (gym == null) return NotFound("Gym not found for this owner.");
            
            await _gymManagementService.AddBranchAsync(gym.Id, branchDto);
            return Ok(new { message = "Branch added successfully" });
        }

        [Authorize(Roles = "GymOwner")]
        [HttpPut("branches/{branchId}")]
        public async Task<IActionResult> UpdateMyBranch(Guid branchId, [FromBody] BranchDto branchDto)
        {
            await _gymManagementService.UpdateBranchAsync(branchId, branchDto);
            return Ok(new { message = "Branch updated successfully" });
        }

        [HttpGet("settings")]
        public async Task<IActionResult> GetMyGymSettings()
        {
            Guid targetGymId = GymId ?? Guid.Empty;
            if (targetGymId == Guid.Empty)
            {
                GymListResponseDto? gym = await _gymManagementService.GetGymByOwnerIdAsync(UserId);
                if (gym != null) targetGymId = gym.Id;
            }

            if (targetGymId == Guid.Empty) return NotFound("Gym settings not found.");

            GymSettingsDto settings = await _gymManagementService.GetGymSettingsAsync(targetGymId);
            return Ok(settings);
        }

        [Authorize(Roles = "GymOwner")]
        [HttpPut("settings")]
        public async Task<IActionResult> UpdateMyGymSettings([FromBody] GymSettingsDto dto)
        {
            Guid targetGymId = GymId ?? Guid.Empty;
            if (targetGymId == Guid.Empty)
            {
                GymListResponseDto? gym = await _gymManagementService.GetGymByOwnerIdAsync(UserId);
                if (gym != null) targetGymId = gym.Id;
            }

            if (targetGymId == Guid.Empty) return NotFound("Gym settings not found.");

            await _gymManagementService.UpdateGymSettingsAsync(targetGymId, dto);
            return Ok(new { message = "Gym settings updated successfully." });
        }

        [HttpGet("holidays")]
        public async Task<IActionResult> GetMyHolidays()
        {
            Guid targetGymId = GymId ?? Guid.Empty;
            if (targetGymId == Guid.Empty)
            {
                GymListResponseDto? gym = await _gymManagementService.GetGymByOwnerIdAsync(UserId);
                if (gym != null) targetGymId = gym.Id;
            }

            if (targetGymId == Guid.Empty) return NotFound("Gym not found.");

            List<GymHolidayDto> holidays = await _gymManagementService.GetHolidaysAsync(targetGymId);
            return Ok(holidays);
        }

        [Authorize(Roles = "GymOwner")]
        [HttpPost("holidays")]
        public async Task<IActionResult> AddMyHoliday([FromBody] GymHolidayDto dto)
        {
            Guid targetGymId = GymId ?? Guid.Empty;
            if (targetGymId == Guid.Empty)
            {
                GymListResponseDto? gym = await _gymManagementService.GetGymByOwnerIdAsync(UserId);
                if (gym != null) targetGymId = gym.Id;
            }

            if (targetGymId == Guid.Empty) return NotFound("Gym not found.");

            await _gymManagementService.AddHolidayAsync(targetGymId, dto);
            return Ok(new { message = "Holiday closure scheduled successfully." });
        }

        [Authorize(Roles = "GymOwner")]
        [HttpDelete("holidays/{holidayId}")]
        public async Task<IActionResult> DeleteMyHoliday(Guid holidayId)
        {
            Guid targetGymId = GymId ?? Guid.Empty;
            if (targetGymId == Guid.Empty)
            {
                GymListResponseDto? gym = await _gymManagementService.GetGymByOwnerIdAsync(UserId);
                if (gym != null) targetGymId = gym.Id;
            }

            if (targetGymId == Guid.Empty) return NotFound("Gym not found.");

            await _gymManagementService.DeleteHolidayAsync(targetGymId, holidayId);
            return Ok(new { message = "Holiday closure removed successfully." });
        }
    }
}
