using GymForge.Application.Modules.Gym.Interfaces;
using GymForge.Contracts.Gym;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymForge.Api.Controllers.Gym
{
    [Route("api/gym-owners")]
    [Authorize(Roles = "SuperAdmin")]
    [ApiController]
    public class GymOwnerController : ControllerBase
    {
        private readonly IGymManagementService _gymManagementService;

        public GymOwnerController(IGymManagementService gymManagementService)
        {
            _gymManagementService = gymManagementService;
        }

        [HttpGet]
        public async Task<ActionResult> GetGymOwnersList()
        {
            var owners = await _gymManagementService.GetGymOwnersList();
            return Ok(owners);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateGymOwner(Guid id, [FromBody] UpdateGymOwnerDto updateGymOwnerDto)
        {
            if (id != updateGymOwnerDto.Id)
            {
                return BadRequest("ID mismatch between URL and payload.");
            }

            GymOwnersDto user = await _gymManagementService.UpdateGymOwner(updateGymOwnerDto);
            return Ok(user);
        }
    }
}
