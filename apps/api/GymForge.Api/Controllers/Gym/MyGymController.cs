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
    }
}
