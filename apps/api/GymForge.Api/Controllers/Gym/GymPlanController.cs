using GymForge.Application.Modules.Gym.Interfaces;
using GymForge.Contracts.GymPlans;
using Microsoft.AspNetCore.Mvc;

namespace GymForge.Api.Controllers.Gym
{
    [Route("api/[controller]")]
    [ApiController]
    public class GymPlanController : ControllerBase
    {
        private readonly IGymPlanService _gymPlanService;

        public GymPlanController(IGymPlanService gymPlanService) 
        {
            _gymPlanService = gymPlanService;
        }

        [HttpGet("{planId}")]
        public async Task<ActionResult> GetGymPlanById(Guid planId)
        {
            return Ok(await _gymPlanService.GetPlanByIdAsync(planId));
        }

        [HttpGet("owner/{ownerId}")]
        public async Task<ActionResult> GetGymPlansByOwnerId(Guid ownerId)
        {
            return Ok(await _gymPlanService.GetPlansByOwnerIdAsync(ownerId));
        }

        [HttpPost("add")]
        public async Task<ActionResult> AddGymPlanAsync([FromBody] CreateGymPlanRequest gymPlan)
        {
            return Ok(await _gymPlanService.AddGymPlanAsync(gymPlan));
        }

        [HttpPut("update")]
        public async Task<ActionResult> UpdateGymPlanAsync([FromBody] UpdateGymPlanRequest gymPlan)
        {
            return Ok(await _gymPlanService.UpdateGymPlanAsync(gymPlan));
        }

        [HttpDelete("{planId}")]
        public async Task<ActionResult> DeleteGymPlanAsync(Guid planId)
        {
            return Ok(await _gymPlanService.DeleteGymPlanAsync(planId));
        }
    }
}
