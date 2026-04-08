using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymForge.Api.Controllers.Gym
{
    [Route("api/[controller]")]
    [Authorize("SuperAdmin")]
    [ApiController]
    public class GymController : ControllerBase
    {
        public async Task<ActionResult> GymOnBoarding()
        {
            return Ok();
        }
    }
}
