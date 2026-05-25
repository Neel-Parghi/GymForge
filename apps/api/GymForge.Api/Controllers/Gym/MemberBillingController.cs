using GymForge.Application.Modules.Gym.Interfaces;
using GymForge.Contracts.Gym.Billing;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymForge.Api.Controllers.Gym
{
    [Route("api/billing/members")]
    [Authorize(Roles = "GymOwner,Staff")]
    public class MemberBillingController : BaseApiController
    {

        private readonly IMemberBillingService _billingService;

        public MemberBillingController(IMemberBillingService billingService)
        {
            _billingService = billingService;
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

            MemberBillingOverviewDto overview = await _billingService.GetMemberBillingOverviewAsync(GymId.Value, SecureBranchId, monthKey);
            return Ok(overview);
        }


        [HttpPost("invoice")]
        public async Task<ActionResult> CreateCustomInvoice([FromBody] CreateCustomInvoiceRequest request)
        {
            if (GymId == null) 
                return Unauthorized();
           
            bool success = await _billingService.CreateCustomInvoiceAsync(GymId.Value, SecureBranchId, request);
            
            if (success)
            {
                return Ok(new { message = "Custom invoice recorded successfully" });
            }

            return BadRequest(new { message = "Failed to record custom invoice" });
        }

        [HttpPost("pay/{recordId}")]
        public async Task<ActionResult> MarkAsPaid(Guid recordId)
        {
            if (GymId == null) 
                return Unauthorized();

            bool success = await _billingService.MarkAsPaidAsync(GymId.Value, recordId);
            if (success)
            {
                return Ok(new { message = "Transaction marked as Paid successfully" });
            }

            return BadRequest(new { message = "Failed to mark transaction as Paid" });
        }
    }
}
