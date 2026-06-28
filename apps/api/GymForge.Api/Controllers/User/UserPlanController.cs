using GymForge.Application.Modules.Gym.Interfaces;
using GymForge.Contracts.GymPlans;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace GymForge.Api.Controllers.User
{
    [Route("api/user-plans")]
    [Authorize(Roles = "User")]
    public class UserPlanController : BaseApiController
    {
        private readonly IGymPlanService _gymPlanService;

        public UserPlanController(IGymPlanService gymPlanService) 
        {
            _gymPlanService = gymPlanService;
        }

        [HttpGet("available")]
        public async Task<ActionResult<IEnumerable<GymPlanDto>>> GetAvailablePlans()
        {
            var activePlans = await _gymPlanService.GetAvailablePlansForMemberAsync(UserId);
            
            if (!activePlans.Any())
                return Ok(new { data = new List<GymPlanDto>() });

            return Ok(new { data = activePlans });
        }
    }
}
