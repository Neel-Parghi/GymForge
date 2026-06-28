using GymForge.Contracts.Payments;
using GymForge.Shared.Models;
using System.Threading.Tasks;

namespace GymForge.Application.Modules.Payments.Interfaces
{
    public interface IMemberPaymentService
    {
        Task<ApiResponse<PaymentInitiationResponse>> InitiateCheckoutAsync(InitiateMemberPaymentRequest request);
        Task<ApiResponse<PaymentVerificationResponse>> VerifyCheckoutAsync(VerifyMemberPaymentRequest request);
        Task<ApiResponse<OfflineCheckoutResponse>> InitiateOfflineCheckoutAsync(OfflineCheckoutRequest request);
    }
}
