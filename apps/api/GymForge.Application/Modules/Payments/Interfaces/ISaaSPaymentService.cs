using GymForge.Contracts.SaaSPayments;
using GymForge.Contracts.SuperAdmin.Configuration;
using GymForge.Domain.Entities;

namespace GymForge.Application.Modules.Payments.Interfaces
{
    public interface ISaaSPaymentService
    {
        Task<InitiatePaymentResponseDto> InitiateSaaSPaymentAsync(CreatePaymentDto paymentDto);
        
        Task<bool> ProcessSuccessfulPaymentAsync(string orderId, string paymentId, string signature);
        
        Task<List<PaymentTransactionDto>> GetAllTransactionsAsync();

        Task<PaymentStatsDto> GetPaymentStatsAsync();

        Task<SaaSConfigurationDto> GetSettingsAsync();

        Task UpdateSettingsAsync(SaaSConfigurationDto settings);
    }
}
