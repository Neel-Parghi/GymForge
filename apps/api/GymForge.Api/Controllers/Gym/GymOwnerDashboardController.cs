using GymForge.Api.Controllers;
using GymForge.Application.Modules.Gym.Interfaces;
using GymForge.Contracts.Gym.Dashboard;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymForge.Api.Controllers.Gym
{
    [Route("api/gym-owner/dashboard")]
    [Authorize(Roles = "GymOwner,Staff")]
    [ApiController]
    public class GymOwnerDashboardController : BaseApiController
    {
        private readonly IGymOwnerDashboardService _dashboardService;

        public GymOwnerDashboardController(IGymOwnerDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("stats")]
        public async Task<ActionResult<GymOwnerDashboardDto>> GetDashboardStats()
        {
            if (GymId == null) return Unauthorized();
            return Ok(await _dashboardService.GetGymOwnerDashboardStatsAsync(GymId.Value));
        }
    }
}
