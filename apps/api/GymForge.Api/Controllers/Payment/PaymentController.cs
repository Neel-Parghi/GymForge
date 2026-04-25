using GymForge.Application.Modules.Payments.Interfaces;
using GymForge.Contracts.SaaSPayments;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymForge.Api.Controllers.Payment
{
    [Route("api/payments")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly ISaaSPaymentService _paymentService;
        public PaymentController(ISaaSPaymentService saaSPaymentService)
        {
            _paymentService = saaSPaymentService;
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
    }
}
