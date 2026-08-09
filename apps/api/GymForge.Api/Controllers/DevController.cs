using GymForge.Application.Modules.Dev.Interface;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace GymForge.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DevController : ControllerBase
    {
        private readonly IDatabaseSeederService _seederService;

        public DevController(IDatabaseSeederService seederService)
        {
            _seederService = seederService;
        }

        [HttpPost("seed")]
        public async Task<IActionResult> Seed()
        {
            await _seederService.SeedAsync();
            return Ok(new { message = "Database successfully seeded with Demo and Admin accounts, including Gym Subscription!" });
        }
    }
}
