using GymForge.Application.Modules.Gym.Interfaces;
using GymForge.Contracts.Gym.Management;
using GymForge.Contracts.Gym.Onboarding;
using GymForge.Contracts.Gym.Shared;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymForge.Api.Controllers.Gym
{
    [Route("api/gyms")]
    [Authorize(Roles = "SuperAdmin")]
    [ApiController]
    public class GymController : ControllerBase
    {
        private readonly IGymManagementService _gymManagementService;
        public GymController(IGymManagementService gymManagementService)
        {
            _gymManagementService = gymManagementService;
        }

        [HttpPost("onboard")]
        public async Task<ActionResult> GymOnBoarding([FromBody] GymOnboardingDto dto)
        {
            if (dto == null) return BadRequest("Invalid request data.");

            Guid ownerId = dto.AssignedOwnerId ?? Guid.Empty;
            
            if (ownerId == Guid.Empty) return BadRequest("Owner assignment is required.");

            await _gymManagementService.OnboardGymAsync(ownerId, dto);
            
            return Ok(new { message = "Gym onboarded successfully" });
        }

        [HttpGet]
        public async Task<ActionResult> GetGymList()
        {
            return Ok(await _gymManagementService.GetGymListAsync());
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateGym(Guid id, [FromBody] UpdateGymDto updateGymDto)
        {
            if (id != updateGymDto.Id)
            {
                return BadRequest("ID mismatch.");
            }

            await _gymManagementService.UpdateGymAsync(updateGymDto);
            return Ok(new { message = "Gym updated successfully" });
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteGym(Guid id)
        {
            await _gymManagementService.DeleteGymAsync(id);
            return NoContent();
        }

        [HttpGet("{id}/branches")]
        public async Task<ActionResult> GetBranches(Guid id)
        {
            return Ok(await _gymManagementService.GetBranchesByGymIdAsync(id));
        }

        [HttpPost("{id}/branches")]
        public async Task<IActionResult> AddBranch(Guid id, [FromBody] BranchDto branchDto)
        {
            await _gymManagementService.AddBranchAsync(id, branchDto);
            return Ok(new { message = "Branch added successfully" });
        }
    }
}
