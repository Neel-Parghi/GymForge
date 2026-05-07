using GymForge.Application.Modules.Gym.Interfaces;
using GymForge.Contracts.GymPlans;
using Microsoft.AspNetCore.Mvc;

namespace GymForge.Api.Controllers.Gym
{
    [Route("api/gym-plans")]
    public class GymPlanController : BaseApiController
    {
        private readonly IGymPlanService _gymPlanService;

        public GymPlanController(IGymPlanService gymPlanService) 
        {
            _gymPlanService = gymPlanService;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetGymPlanById(Guid id)
        {
            return Ok(await _gymPlanService.GetPlanByIdAsync(id));
        }

        [HttpGet("~/api/gym-owners/{ownerId}/plans")]
        public async Task<ActionResult> GetGymPlansByOwnerId(Guid ownerId)
        {
            return Ok(await _gymPlanService.GetPlansByOwnerIdAsync(ownerId));
        }

        [HttpPost]
        public async Task<ActionResult> AddGymPlanAsync([FromBody] CreateGymPlanRequest gymPlan)
        {
            return Ok(await _gymPlanService.AddGymPlanAsync(gymPlan));
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateGymPlanAsync(Guid id, [FromBody] UpdateGymPlanRequest gymPlan)
        {
            return Ok(await _gymPlanService.UpdateGymPlanAsync(gymPlan));
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteGymPlanAsync(Guid id)
        {
            return Ok(await _gymPlanService.DeleteGymPlanAsync(id));
        }
    }
}
