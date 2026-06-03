using GymForge.Application.Modules.Workout.Interface;
using GymForge.Contracts.WorkoutPlan;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymForge.Api.Controllers.Gym
{
    [Route("api/workout-plan")]
    [Authorize(Roles = "GymOwner,Staff,Trainer")]
    [ApiController]
    public class WorkoutPlanController : BaseApiController
    {
        private readonly IWorkoutPlanService _workoutPlanService;

        public WorkoutPlanController(IWorkoutPlanService workoutPlanService)
        {
            _workoutPlanService = workoutPlanService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<WorkoutPlanDto>>> GetPlans([FromQuery] string? type = null)
        {
            if (GymId == null) return Unauthorized();
            
            IEnumerable<WorkoutPlanDto> plans = await _workoutPlanService.GetPlansByGymIdAsync(GymId.Value, type);
            return Ok(plans);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<WorkoutPlanDto>> GetPlanById(Guid id)
        {
            WorkoutPlanDto? plan = await _workoutPlanService.GetPlanByIdAsync(id);
            if (plan == null) 
                return NotFound("Workout plan not found.");
            
            return Ok(plan);
        }

        [HttpPost]
        public async Task<ActionResult<WorkoutPlanDto>> CreatePlan([FromBody] CreateWorkoutPlanRequest request)
        {
            if (GymId == null) 
                return Unauthorized();
            
            WorkoutPlanDto result = await _workoutPlanService.CreatePlanAsync(request, GymId.Value, UserId);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<WorkoutPlanDto>> UpdatePlan(Guid id, [FromBody] UpdateWorkoutPlanRequest request)
        {
            if (GymId == null) 
                return Unauthorized();
            if (id != request.Id) 
                return BadRequest("Plan ID mismatch.");

            try
            {
                WorkoutPlanDto result = await _workoutPlanService.UpdatePlanAsync(request, GymId.Value, UserId);
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
            bool success = await _workoutPlanService.DeletePlanAsync(id);
            if (!success) 
                return NotFound("Workout plan not found.");
            
            return Ok(new { message = "Workout plan deleted successfully." });
        }
    }
}
