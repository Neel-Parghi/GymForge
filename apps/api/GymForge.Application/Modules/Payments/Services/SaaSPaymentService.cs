using GymForge.Application.Modules.Payments.Interfaces;
using GymForge.Contracts.SaaSPayments;
using GymForge.Domain.Entities;
using GymForge.Domain.Interface;
using Microsoft.Extensions.Configuration;
using Razorpay.Api;

namespace GymForge.Application.Modules.Payments.Services
{
    public class SaaSPaymentService : ISaaSPaymentService
    {
        private readonly ISaaSPaymentRepository _paymentRepository;
        private readonly IGymManagementRepository _gymManagementRepository;
        private readonly ISaaSPlanRepository _saaSPlanRepository;
        private readonly IUnitOfWork _uow;
        private readonly IConfiguration _config;


        public SaaSPaymentService(IUnitOfWork uow, ISaaSPaymentRepository saaSPaymentRepository, IGymManagementRepository gymManagementRepository, ISaaSPlanRepository saaSPlanRepository, IConfiguration config)
        {
            _uow = uow;
            _paymentRepository = saaSPaymentRepository;
            _gymManagementRepository = gymManagementRepository;
            _saaSPlanRepository = saaSPlanRepository;
            _config = config;
        }

        public async Task<InitiatePaymentResponseDto> InitiateSaaSPaymentAsync(CreatePaymentDto paymentDto)
        {
            Domain.Entities.Plan? plan = await _saaSPlanRepository.GetPlanByIdAsync(paymentDto.PlanId);

            if (plan == null) throw new Exception("Plan not found");

            string razorPayAPIKeyId = _config["RazorPay:ApiKeyId"]!;
            string razorPayAPIKeySecret = _config["RazorPay:ApiKeySecret"]!;

            RazorpayClient client = new(razorPayAPIKeyId, razorPayAPIKeySecret);
            Dictionary<string, object> options = [];
            options.Add("amount", (int)(plan.Price * 100));
            options.Add("currency", "INR");
            options.Add("receipt", Guid.NewGuid().ToString());

            Order order = client.Order.Create(options);
            string razorpayOrderId = order["id"].ToString();

            SaaSPaymentTransaction transaction = new()
            {
                GymId = paymentDto.GymId,
                Amount = plan.Price,
                Currency = "INR",
                Status = "Pending",
                GatewayTransactionId = razorpayOrderId
            };

            GymSubscription gymSubscription = new()
            {
                GymId = paymentDto.GymId,
                PlanId = paymentDto.PlanId,
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddMonths(1),
                IsActive = plan.IsActive,
                IsTrial = plan.IsTrial,
                PriceAtPurchase = plan.Price
            };

            transaction.Subscription = gymSubscription;

            await _paymentRepository.AddAsync(transaction);
            await _uow.SaveChangesAsync();

            return new InitiatePaymentResponseDto
            {
                TransactionId = transaction.Id,
                RazorpayOrderId = razorpayOrderId
            };
        }

        public async Task<bool> ProcessSuccessfulPaymentAsync(string gatewayId, string gatewayResponse)
        {
            SaaSPaymentTransaction? transaction = await _paymentRepository.GetByGatewayIdAsync(gatewayId);

            if (transaction == null) return false;

            transaction.Status = "Success";
            transaction.GatewayResponse = gatewayResponse; // Payment ID

            GymSubscription subscription = transaction.Subscription;

            subscription?.IsActive = true;

            await _uow.SaveChangesAsync();
         
            return true;
        }

        public async Task<List<PaymentTransactionDto>> GetAllTransactionsAsync()
        {
            List<SaaSPaymentTransaction>? transactions = await _paymentRepository.GetTransactionsAsync();

            return [.. transactions.Select(t => new PaymentTransactionDto
            {
                Id = t.Id,
                GymName = t.Gym?.GymName ?? "Unknown",
                PlanName = t.Subscription?.Plan?.Name ?? "Unknown",
                Amount = t.Amount,
                Status = t.Status,
                CreatedAt = t.CreatedOn,
                GatewayTransactionId = t.GatewayTransactionId
            })];
        }

        public async Task<PaymentStatsDto> GetPaymentStatsAsync()
        {
            List<SaaSPaymentTransaction>? transactions = await _paymentRepository.GetTransactionsAsync();

            List<SaaSPaymentTransaction>? successTxs = [..transactions.Where(t => t.Status == "success")];

            return new PaymentStatsDto
            {
                TotalRevenue = successTxs.Sum(t => t.Amount),
                MonthlyRecurringRevenue = successTxs.Where(t=> t.CreatedOn > DateTime.UtcNow.AddDays(-30)).Sum(t => t.Amount),
                ActiveSubscriptions = successTxs.Count(t=>t.Subscription?.IsActive == true)
            };
        }
    }
}
