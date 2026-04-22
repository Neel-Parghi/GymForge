using GymForge.Domain.Entities;

namespace GymForge.Domain.Interface
{
    public interface ISaaSPaymentRepository
    {
        Task AddAsync(SaaSPaymentTransaction transaction);

        Task<List<SaaSPaymentTransaction>> GetTransactionsAsync();

        Task<SaaSPaymentTransaction?> GetByGatewayIdAsync(string gatewayId);

        Task UpdateStatusAsync(Guid id, string status, string? gatewayResponse = null);
    }
}
