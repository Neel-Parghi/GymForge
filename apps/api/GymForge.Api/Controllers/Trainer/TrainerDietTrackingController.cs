using GymForge.Application.Modules.Diet.Interfaces;
using GymForge.Application.Modules.Gym.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace GymForge.Api.Controllers.Trainer
{
    [ApiController]
    [Route("api/trainer/diet-tracking")]
    [Authorize(Roles = "Trainer,GymOwner")]
    public class TrainerDietTrackingController : BaseApiController
    {
        private readonly IDietTrackingService _dietTrackingService;
        private readonly IStaffService _staffService;

        public TrainerDietTrackingController(IDietTrackingService dietTrackingService, IStaffService staffService)
        {
            _dietTrackingService = dietTrackingService;
            _staffService = staffService;
        }

        private async Task<bool> IsAuthorizedToViewMemberAsync(Guid memberId)
        {
            var role = User.FindFirstValue(ClaimTypes.Role);
            var currentUserId = UserId;
            if (currentUserId == Guid.Empty) return false;

            if (role == "Trainer")
            {
                var assignedMembers = await _staffService.GetAssignedMembersAsync(currentUserId);
                return assignedMembers.Any(m => m.MemberId == memberId);
            }
            
            if (role == "GymOwner" || role == "Staff")
            {
                return true;
            }

            return false;
        }

        [HttpGet("{memberId}/{date}")]
        public async Task<IActionResult> GetMemberDietLog(Guid memberId, DateTime date)
        {
            if (!await IsAuthorizedToViewMemberAsync(memberId)) return Forbid();
            var log = await _dietTrackingService.GetDietLogAsync(memberId, date);
            return Ok(log);
        }

        [HttpGet("{memberId}/summary/{endDate}")]
        public async Task<IActionResult> GetMemberWeeklySummary(Guid memberId, DateTime endDate)
        {
            if (!await IsAuthorizedToViewMemberAsync(memberId)) return Forbid();
            var summary = await _dietTrackingService.GetWeeklySummaryAsync(memberId, endDate);
            return Ok(summary);
        }
    }
}
