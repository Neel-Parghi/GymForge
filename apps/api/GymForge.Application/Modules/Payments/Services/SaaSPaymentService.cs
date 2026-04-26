using AutoMapper;
using GymForge.Application.Modules.Payments.Interfaces;
using GymForge.Contracts.SaaSPayments;
using GymForge.Contracts.SuperAdmin.Configuration;
using GymForge.Domain.Entities;
using GymForge.Domain.Interface;
using Microsoft.Extensions.Configuration;
using Razorpay.Api;

namespace GymForge.Application.Modules.Payments.Services
{
    public class SaaSPaymentService : ISaaSPaymentService
    {
        private readonly ISaaSPaymentRepository _paymentRepository;
        private readonly ISaaSConfigurationRepository _configRepository;
        private readonly IGymManagementRepository _gymManagementRepository;
        private readonly ISaaSPlanRepository _saaSPlanRepository;
        private readonly IUnitOfWork _uow;
        private readonly IConfiguration _config;
        private readonly IMapper _mapper;

        public SaaSPaymentService(IUnitOfWork uow, ISaaSPaymentRepository saaSPaymentRepository, IGymManagementRepository gymManagementRepository, ISaaSPlanRepository saaSPlanRepository, IConfiguration config, ISaaSConfigurationRepository configRepository, IMapper mapper)
        {
            _uow = uow;
            _paymentRepository = saaSPaymentRepository;
            _gymManagementRepository = gymManagementRepository;
            _saaSPlanRepository = saaSPlanRepository;
            _config = config;
            _configRepository = configRepository;
            _mapper = mapper;
        }

        public async Task<SaaSConfigurationDto> GetSettingsAsync()
        {
            var settings = await _configRepository.GetConfigurationAsync();
            return _mapper.Map<SaaSConfigurationDto>(settings);
        }

        public async Task UpdateSettingsAsync(SaaSConfigurationDto settingsDto)
        {
            var settings = await _configRepository.GetConfigurationAsync();
            _mapper.Map(settingsDto, settings);
            
            await _configRepository.UpdateConfigurationAsync(settings);
            await _uow.SaveChangesAsync();
        }

        public async Task<InitiatePaymentResponseDto> InitiateSaaSPaymentAsync(CreatePaymentDto paymentDto)
        {
            Domain.Entities.Plan? plan = await _saaSPlanRepository.GetPlanByIdAsync(paymentDto.PlanId);

            if (plan == null) throw new Exception("Plan not found");

            GymForge.Domain.Entities.Gym? gym = await _gymManagementRepository.GetGymByIdAsync(paymentDto.GymId);
            if (gym == null) throw new Exception($"Gym with ID {paymentDto.GymId} not found. Please verify the GymId.");

            string razorPayAPIKeyId = _config["RazorPay:ApiKeyId"]!;
            string razorPayAPIKeySecret = _config["RazorPay:ApiKeySecret"]!;

            RazorpayClient client = new(razorPayAPIKeyId, razorPayAPIKeySecret);
            Dictionary<string, object> options = [];
            options.Add("amount", (int)(plan.Price * 100));
            options.Add("currency", "INR");
            options.Add("receipt", Guid.NewGuid().ToString());

            Order order = client.Order.Create(options);
            string razorpayOrderId = order["id"].ToString();

            var transactionId = Guid.NewGuid();
            var subscriptionId = Guid.NewGuid();

            SaaSPaymentTransaction transaction = new()
            {
                Id = transactionId,
                GymId = paymentDto.GymId,
                Gym = gym,
                SubscriptionId = subscriptionId, 
                Amount = plan.Price,
                Currency = "INR",
                Status = "Pending",
                GatewayTransactionId = razorpayOrderId
            };

            SubscriptionRecord gymSubscription = new()
            {
                Id = subscriptionId,
                GymId = paymentDto.GymId,
                PlanId = paymentDto.PlanId,
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddMonths(1),
                IsActive = false,
                IsTrial = plan.IsTrial,
                PriceAtPurchase = plan.Price
            };

            transaction.Subscription = gymSubscription;

            await _paymentRepository.AddAsync(transaction);
            
            await _uow.SaveChangesAsync();

            return new InitiatePaymentResponseDto
            {
                TransactionId = transaction.Id,
                RazorpayOrderId = razorpayOrderId,
                Amount = (int)(plan.Price * 100)
            };
        }

        public async Task<bool> ProcessSuccessfulPaymentAsync(string orderId, string paymentId, string signature)
        {
            string keyId = _config["RazorPay:ApiKeyId"]!;
            string secret = _config["RazorPay:ApiKeySecret"]!;

            // Initialize client and set global credentials for the static Utils class
            RazorpayClient client = new RazorpayClient(keyId, secret);
            //RazorpayClient.Key = keyId;
            //RazorpayClient.Secret = secret;

            try 
            {
                Dictionary<string, string> attributes = [];
                attributes.Add("razorpay_order_id", orderId);
                attributes.Add("razorpay_payment_id", paymentId);
                attributes.Add("razorpay_signature", signature);

                Utils.verifyPaymentSignature(attributes);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"SIGNATURE VERIFICATION FAILED: {ex.Message}");
                return false;
            }

            SaaSPaymentTransaction? transaction = await _paymentRepository.GetByGatewayIdAsync(orderId);
            if (transaction == null) return false;

            transaction.Status = "Success";
            transaction.GatewayResponse = paymentId;

            if (transaction.Subscription != null)
            {
                transaction.Subscription.IsActive = true;
            }

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

            List<SaaSPaymentTransaction> successTxs = transactions
                .Where(t => t.Status.Equals("Success", StringComparison.OrdinalIgnoreCase))
                .ToList();

            return new PaymentStatsDto
            {
                TotalRevenue = successTxs.Sum(t => t.Amount),
                MonthlyRecurringRevenue = successTxs.Where(t=> t.CreatedOn > DateTime.UtcNow.AddDays(-30)).Sum(t => t.Amount),
                ActiveSubscriptions = successTxs.Count(t=>t.Subscription?.IsActive == true)
            };
        }
    }
}
