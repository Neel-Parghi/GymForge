using GymForge.Application.Modules.Diet.Interface;
using GymForge.Contracts.DietPlan;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymForge.Api.Controllers.Gym
{
    [Route("api/diet-plan")]
    [Authorize(Roles = "GymOwner,Staff,Trainer")]
    [ApiController]
    public class DietPlanController : BaseApiController
    {
        private readonly IDietPlanService _dietPlanService;

        public DietPlanController(IDietPlanService dietPlanService)
        {
            _dietPlanService = dietPlanService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DietPlanDto>>> GetPlans([FromQuery] string? goal = null)
        {
            if (GymId == null) return Unauthorized();
            
            IEnumerable<DietPlanDto> plans = await _dietPlanService.GetPlansByGymIdAsync(GymId.Value, goal);
            return Ok(plans);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DietPlanDto>> GetPlanById(Guid id)
        {
            DietPlanDto? plan = await _dietPlanService.GetPlanByIdAsync(id);
            if (plan == null) 
                return NotFound("Diet plan not found.");
            
            return Ok(plan);
        }

        [HttpPost]
        public async Task<ActionResult<DietPlanDto>> CreatePlan([FromBody] CreateDietPlanRequest request)
        {
            if (GymId == null) 
                return Unauthorized();
            
            DietPlanDto result = await _dietPlanService.CreatePlanAsync(request, GymId.Value, UserId);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<DietPlanDto>> UpdatePlan(Guid id, [FromBody] UpdateDietPlanRequest request)
        {
            if (GymId == null) 
                return Unauthorized();
            if (id != request.Id) 
                return BadRequest("Plan ID mismatch.");

            try
            {
                DietPlanDto result = await _dietPlanService.UpdatePlanAsync(request, GymId.Value, UserId);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeletePlan(Guid id)
        {
            bool success = await _dietPlanService.DeletePlanAsync(id);
            if (!success) 
                return NotFound("Diet plan not found.");
            
            return Ok(new { message = "Diet plan deleted successfully." });
        }
    }
}
