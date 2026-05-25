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

        [HttpGet("subscription")]
        [Authorize(Roles = "GymOwner,SuperAdmin")]
        public async Task<IActionResult> GetSubscription()
        {
            if (GymId == null) return Unauthorized();

            GymSubscriptionStatusDto subscription = await _paymentService.GetSubscriptionStatusAsync(GymId.Value);
            return Ok(subscription);
        }

        [HttpPost("subscription/renew")]
        [Authorize(Roles = "GymOwner")]
        public async Task<IActionResult> RenewSubscription([FromQuery] string planName = "GymForge Pro Plan", [FromQuery] decimal price = 4999)
        {
            if (GymId == null) return Unauthorized();

            GymSubscriptionStatusDto subscription = await _paymentService.RenewGymSubscriptionAsync(GymId.Value, planName, price);
            return Ok(subscription);
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

        [HttpPost("initiate")]
        [Authorize]
        public async Task<IActionResult> InitiatePayment([FromBody] CreatePaymentDto payload)
        {
            InitiatePaymentResponseDto transactionResponse = await _paymentService.InitiateSaaSPaymentAsync(payload);
            return Ok(new { transactionResponse });
        }

        [HttpPost("verify")]
        [Authorize]
        public async Task<IActionResult> VerifyPayment([FromBody] VerifyPaymentDto payload)
        {
            bool success = await _paymentService.ProcessSuccessfulPaymentAsync(payload.OrderId, payload.PaymentId, payload.Signature);
            return success ? Ok() : BadRequest("Invalid Transaction");
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
