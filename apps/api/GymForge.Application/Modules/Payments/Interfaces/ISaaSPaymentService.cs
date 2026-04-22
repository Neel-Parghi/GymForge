using GymForge.Contracts.SaaSPayments;

namespace GymForge.Application.Modules.Payments.Interfaces
{
    public interface ISaaSPaymentService
    {
        Task<InitiatePaymentResponseDto> InitiateSaaSPaymentAsync(CreatePaymentDto paymentDto);
        
        Task<bool> ProcessSuccessfulPaymentAsync(string gatewayId, string gatewayResponse);
        
        Task<List<PaymentTransactionDto>> GetAllTransactionsAsync();

        Task<PaymentStatsDto> GetPaymentStatsAsync();
    }
}
