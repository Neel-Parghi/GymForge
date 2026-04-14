using GymForge.Application.Modules.Auth.Interface;
using GymForge.Application.Modules.Users.Interface;
using GymForge.Contracts.Users;
using GymForge.Domain.Entities;
using GymForge.Domain.Interface;
using GymForge.Shared.Enums;
using Microsoft.Extensions.Configuration;

namespace GymForge.Application.Modules.Users.Services
{
    public class UserService : IUserService
    {
        private readonly IAuthRepository _authRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IPasswordService _passwordService;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _config;

        public UserService(
            IAuthRepository authRepository, 
            IUnitOfWork unitOfWork, 
            IPasswordService passwordService,
            IEmailService emailService,
            IConfiguration config)
        {
            _authRepository = authRepository;
            _unitOfWork = unitOfWork;
            _passwordService = passwordService;
            _emailService = emailService;
            _config = config;
        }

        public async Task InviteOwnerAsync(InviteOwnerRequestDto inviteOwnerRequestDto)
        {
            string token = Guid.NewGuid().ToString();

            User user = new()
            {
                FirstName = inviteOwnerRequestDto.FirstName,
                LastName = inviteOwnerRequestDto.LastName,
                Email = inviteOwnerRequestDto.Email,
                Phone = inviteOwnerRequestDto.Phone,
                Role = UserRole.GymOwner,
                InvitationToken = token,
                InvitationExpiry = DateTime.UtcNow.AddDays(7),
                IsInvitationAccepted = false,   
                IsActive = true,
                CreatedOn = DateTime.UtcNow,
                ModifiedOn = DateTime.UtcNow
            };

            await _authRepository.AddUserAsync(user);
            await _unitOfWork.SaveChangesAsync();

            await _emailService.SendInvitationEmailAsync(user.Email, $"{user.FirstName} {user.LastName}", token);
        }

        public async Task SetPasswordAsync(SetPasswordRequestDto setPasswordRequestDto)
        {
            User? user = await _authRepository.GetByTokenAsync(setPasswordRequestDto.Token);

            if (user == null || user.InvitationExpiry < DateTime.UtcNow)
                throw new Exception("The invitation link is invalid or has expired.");

            user.PasswordHash = _passwordService.HashPassword(setPasswordRequestDto.Password);
            user.IsInvitationAccepted = true;
            user.InvitationToken = null;
            user.InvitationExpiry = null;
            user.ModifiedOn = DateTime.UtcNow;

            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<bool> ValidateInvitationTokenAsync(string token)
        {
            User? user = await _authRepository.GetByTokenAsync(token);
            return user != null && user.InvitationExpiry > DateTime.UtcNow;
        }

        public async Task ReInviteOwnerAsync(Guid userId)
        {
            User? user = await _authRepository.GetUserByIdAsync(userId);
            
            if (user == null)
                throw new Exception("User not found.");

            if (user.IsInvitationAccepted)
                throw new Exception("Invitation has already been accepted.");

            string token = Guid.NewGuid().ToString();
            user.InvitationToken = token;
            user.InvitationExpiry = DateTime.UtcNow.AddDays(7);
            user.ModifiedOn = DateTime.UtcNow;

            await _unitOfWork.SaveChangesAsync();

            await _emailService.SendInvitationEmailAsync(user.Email, $"{user.FirstName} {user.LastName}", token);
        }
    }
}
