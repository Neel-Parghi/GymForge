using GymForge.Application.Modules.Gym.Interfaces;
using GymForge.Contracts.Gym.Billing;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymForge.Api.Controllers.Gym
{
    [Route("api/billing/staff")]
    [Authorize(Roles = "GymOwner,Staff")]
    public class StaffPayrollController : BaseApiController
    {
        private readonly IStaffPayrollService _payrollService;

        public StaffPayrollController(IStaffPayrollService payrollService)
        {
            _payrollService = payrollService;
        }

        [HttpGet("overview")]
        public async Task<ActionResult> GetOverview([FromQuery] string monthKey)
        {
            if (GymId == null) 
                return Unauthorized();

            if (string.IsNullOrEmpty(monthKey))
            {
                monthKey = DateTime.UtcNow.ToString("yyyy-MM");
            }

            StaffPayrollOverviewDto overview = await _payrollService.GetStaffPayrollOverviewAsync(GymId.Value, SecureBranchId, monthKey);
            return Ok(overview);
        }

        [HttpPost("rules")]
        public async Task<ActionResult> UpdateRules([FromBody] UpdateStaffPayrollRuleRequest request)
        {
            if (GymId == null) 
                return Unauthorized();

            bool success = await _payrollService.UpdateStaffPayrollRuleAsync(GymId.Value, request);
            if (success)
            {
                return Ok(new { message = "Staff payroll rules updated successfully" });
            }

            return BadRequest(new { message = "Failed to update staff payroll rules" });
        }

        [HttpPost("payout/release")]
        public async Task<ActionResult> ReleasePayout([FromBody] ReleaseStaffPayoutRequest request)
        {
            if (GymId == null) 
                return Unauthorized();

            bool success = await _payrollService.ReleaseStaffPayoutAsync(GymId.Value, SecureBranchId, request);
            if (success)
            {
                return Ok(new { message = "Staff payout released successfully" });
            }

            return BadRequest(new { message = "Failed to release staff payout" });
        }
    }
}
