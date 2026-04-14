using GymForge.Contracts.Users;

namespace GymForge.Application.Modules.Users.Interface
{
    public interface IUserService
    {
        Task InviteOwnerAsync(InviteOwnerRequestDto inviteOwnerRequestDto);

        Task SetPasswordAsync(SetPasswordRequestDto setPasswordRequestDto);

        Task<bool> ValidateInvitationTokenAsync(string token);

        Task ReInviteOwnerAsync(Guid userId);
    }
}
