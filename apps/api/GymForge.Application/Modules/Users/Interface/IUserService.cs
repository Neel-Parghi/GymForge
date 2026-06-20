using GymForge.Contracts.Users;
using Microsoft.AspNetCore.Http;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using GymForge.Contracts.Common;
using GymForge.Shared.Models;

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

        Task<UserProfileDto> GetMyProfileAsync();

        Task UpdateMyProfileAsync(UpdateUserProfileDto dto);

        Task ChangeMyPasswordAsync(ChangePasswordRequestDto dto);

        Task<string> UploadAvatarAsync(IFormFile file);

        Task<IEnumerable<DeletionRequestDto>> GetPendingDeletionRequestsAsync();

        Task<PagedResponse<StandaloneUserDto>> GetStandaloneUsersAsync(PaginationParams pagination);
    }
}
