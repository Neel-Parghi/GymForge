using GymForge.Application.Modules.Gym.Interfaces;
using GymForge.Contracts.SaaSPlan;
using Microsoft.AspNetCore.Mvc;

namespace GymForge.Api.Controllers.Gym
{
    [Route("api/[controller]")]
    [ApiController]
    public class SaaSPlanController : ControllerBase
    {
        private readonly ISaaSPlanService _saaSPlanService;
        public SaaSPlanController(ISaaSPlanService saaSPlanService)
        {
            _saaSPlanService = saaSPlanService;
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetPricingListAsync() 
        {
            return Ok(await _saaSPlanService.GetAllPlansAsync());
        }

        [HttpGet("get/{id}")]
        public async Task<IActionResult> GetPlanByIdAsync(Guid id)
        {
            SaaSPlanDto? plan = await _saaSPlanService.GetPlanByIdAsync(id);
            if (plan == null) return NotFound();
            return Ok(plan);
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddPlanAsync([FromBody] CreateSaaSPlanDto createPlanDto)
        {
            return Ok(await _saaSPlanService.AddPlanAsync(createPlanDto));
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdatePlan([FromBody] UpdateSaaSPlanDto updateSaaSPlanDto)
        {
            SaaSPlanDto updatedPlan = await _saaSPlanService.UpdatePlanAsync(updateSaaSPlanDto);
            return Ok(updatedPlan);
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeletePlanAsync(Guid id)
        {
            bool deleted = await _saaSPlanService.DeletePlanAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
