using GymForge.Contracts.Users;
using System;
using System.Threading.Tasks;

namespace GymForge.Application.Modules.Users.Interface
{
    public interface IUserService
    {
        Task InviteOwnerAsync(InviteOwnerRequestDto inviteOwnerRequestDto);

        Task SetPasswordAsync(SetPasswordRequestDto setPasswordRequestDto);

        Task ChangePasswordAsync(Guid userId, ChangePasswordRequestDto dto);

        Task<bool> ValidateInvitationTokenAsync(string token);

        Task ReInviteOwnerAsync(Guid userId);

        Task<UserProfileDto> GetUserProfileAsync(Guid userId);

        Task UpdateUserProfileAsync(Guid userId, UpdateUserProfileDto updateUserProfileDto);
    }
}
