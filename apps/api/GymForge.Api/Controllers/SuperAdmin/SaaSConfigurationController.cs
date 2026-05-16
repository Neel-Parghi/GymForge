using System.Threading.Tasks;
using GymForge.Application.Modules.SuperAdmin.Interfaces;
using GymForge.Contracts.SuperAdmin.Configuration;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymForge.Api.Controllers.SuperAdmin
{
    [ApiController]
    [Route("api/superadmin/config")]
    [Authorize(Roles = "SuperAdmin,GymOwner")]
    public class SaaSConfigurationController : ControllerBase
    {
        private readonly ISaaSConfigurationService _configService;

        public SaaSConfigurationController(ISaaSConfigurationService configService)
        {
            _configService = configService;
        }

        [HttpGet]
        public async Task<IActionResult> GetConfig()
        {
            SaaSConfigurationDto config = await _configService.GetConfigurationAsync();
            return Ok(config);
        }

        [HttpPost]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> UpdateConfig([FromBody] SaaSConfigurationDto configDto)
        {
            await _configService.UpdateConfigurationAsync(configDto);
            return Ok(new { Success = true, Message = "Platform configuration updated successfully" });
        }
    }
}
