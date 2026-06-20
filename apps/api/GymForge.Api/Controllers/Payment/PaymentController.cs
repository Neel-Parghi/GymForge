using GymForge.Application.Modules.Payments.Interfaces;
using GymForge.Contracts.SaaSPayments;
using GymForge.Contracts.SuperAdmin.Configuration;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymForge.Api.Controllers.Payment
{
    [Route("api/payments")]
    [ApiController]
    public class PaymentController : BaseApiController
    {
        private readonly ISaaSPaymentService _paymentService;
        public PaymentController(ISaaSPaymentService saaSPaymentService)
        {
            _paymentService = saaSPaymentService;
        }

        [HttpGet("history")]
        [Authorize(Roles = "GymOwner")]
        public async Task<IActionResult> GetGymTransactionHistory()
        {
            if (GymId == null) return Unauthorized();

            List<PaymentTransactionDto> history = await _paymentService.GetGymTransactionsAsync(GymId.Value);
            return Ok(history);
        }

        [HttpGet("stats")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> GetStats()
        {
            PaymentStatsDto stats = await _paymentService.GetPaymentStatsAsync();
            return Ok(stats);
        }

        [HttpGet("transactions")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> GetTransactions()
        {
            List<PaymentTransactionDto> transactions = await _paymentService.GetAllTransactionsAsync();
            return Ok(transactions);
        }

        [HttpGet("settings")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> GetSettings()
        {
            SaaSConfigurationDto settings = await _paymentService.GetSettingsAsync();
            return Ok(settings);
        }

        [HttpPut("settings/update")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> UpdateSettings([FromBody] SaaSConfigurationDto settings)
        {
            await _paymentService.UpdateSettingsAsync(settings);
            return Ok();
        }
    }
}
