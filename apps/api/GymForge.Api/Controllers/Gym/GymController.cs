using GymForge.Application.Modules.Gym.Interfaces;
using GymForge.Contracts.Gym;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymForge.Api.Controllers.Gym
{
    [Route("api/[controller]")]
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

        [HttpGet("gym-owner")]
        public async Task<ActionResult> GetGymOwnersList()
        {
            return Ok(await _gymManagementService.GetGymOwnersList());
        }

    }
}
