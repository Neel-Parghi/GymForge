using GymForge.Application.Modules.Gym.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymForge.Api.Controllers.Gym
{
    [Route("api/my-gym")]
    [Authorize(Roles = "GymOwner")]
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
            var gym = await _gymManagementService.GetGymByOwnerIdAsync(UserId);
            if (gym == null) return NotFound("Gym not found for this owner.");
            return Ok(gym);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateMyGym([FromBody] GymForge.Contracts.Gym.Owners.UpdateMyGymDto updateDto)
        {
            await _gymManagementService.UpdateMyGymAsync(UserId, updateDto);
            return Ok(new { message = "Gym profile updated successfully." });
        }
        [HttpGet("branches")]
        public async Task<IActionResult> GetMyBranches()
        {
            var gym = await _gymManagementService.GetGymByOwnerIdAsync(UserId);
            if (gym == null) return NotFound("Gym not found for this owner.");
            
            var branches = await _gymManagementService.GetBranchesByGymIdAsync(gym.Id);
            return Ok(branches);
        }

        [HttpPost("branches")]
        public async Task<IActionResult> AddMyBranch([FromBody] GymForge.Contracts.Gym.Shared.BranchDto branchDto)
        {
            var gym = await _gymManagementService.GetGymByOwnerIdAsync(UserId);
            if (gym == null) return NotFound("Gym not found for this owner.");
            
            await _gymManagementService.AddBranchAsync(gym.Id, branchDto);
            return Ok(new { message = "Branch added successfully" });
        }

        [HttpPut("branches/{branchId}")]
        public async Task<IActionResult> UpdateMyBranch(Guid branchId, [FromBody] GymForge.Contracts.Gym.Shared.BranchDto branchDto)
        {
            await _gymManagementService.UpdateBranchAsync(branchId, branchDto);
            return Ok(new { message = "Branch updated successfully" });
        }
    }
}
