using GymForge.Application.Modules.Payments.Interfaces;
using GymForge.Contracts.SaaSPayments;
using GymForge.Contracts.SuperAdmin.Configuration;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GymForge.Api.Filters;

namespace GymForge.Api.Controllers.Payment
{
    [Route("api/payments")]
    [ApiController]
    [AllowExpiredSubscription]
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

        [HttpPost("initiate")]
        [Authorize(Roles = "GymOwner")]
        public async Task<IActionResult> InitiatePayment([FromBody] CreatePaymentDto request)
        {
            InitiatePaymentResponseDto response = await _paymentService.InitiateSaaSPaymentAsync(request);
            return Ok(response);
        }

        [HttpPost("verify")]
        [Authorize(Roles = "GymOwner")]
        public async Task<IActionResult> VerifyPayment([FromBody] VerifyPaymentRequestDto request)
        {
            bool verified = await _paymentService.ProcessSuccessfulPaymentAsync(request.OrderId, request.PaymentId, request.Signature);
            if (!verified)
            {
                return BadRequest(new { message = "Payment verification failed." });
            }

            return Ok(new { message = "Payment verified successfully." });
        }

        [HttpPost("renew")]
        [Authorize(Roles = "GymOwner")]
        public async Task<IActionResult> RenewSubscription([FromBody] RenewSaaSRequestDto request)
        {
            if (GymId == null) return Unauthorized();

            var status = await _paymentService.RenewGymSubscriptionAsync(GymId.Value, request.PlanId);
            return Ok(status);
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
