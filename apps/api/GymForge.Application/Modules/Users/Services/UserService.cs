using AutoMapper;
using GymForge.Application.Modules.Auth.Interface;
using GymForge.Application.Modules.Common.Interfaces;
using GymForge.Application.Modules.Users.Interface;
using GymForge.Contracts.Users;
using GymForge.Domain.Entities;
using GymForge.Domain.Interface;
using GymForge.Shared.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace GymForge.Application.Modules.Users.Services
{
    public class UserService : IUserService
    {
        private readonly IAuthRepository _authRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IPasswordService _passwordService;
        private readonly IEmailService _emailService;
        private readonly ICurrentUserService _currentUserService;
        private readonly IConfiguration _config;
        private readonly IFileStorageService _fileStorageService;
        private readonly IAddressRepository _addressRepository;
        private readonly IMapper _mapper;

        public UserService(
            IAuthRepository authRepository, 
            IUnitOfWork unitOfWork, 
            IPasswordService passwordService,
            IEmailService emailService,
            ICurrentUserService currentUserService,
            IConfiguration config,
            IFileStorageService fileStorageService,
            IAddressRepository addressRepository,
            IMapper mapper)
        {
            _authRepository = authRepository;
            _unitOfWork = unitOfWork;
            _passwordService = passwordService;
            _emailService = emailService;
            _currentUserService = currentUserService;
            _config = config;
            _fileStorageService = fileStorageService;
            _addressRepository = addressRepository;
            _mapper = mapper;
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

        public async Task<UserProfileDto> GetUserProfileAsync(Guid userId)
        {
            User? user = await _authRepository.GetUserByIdAsync(userId);
            
            if (user == null)
                throw new Exception("User not found.");

            return new UserProfileDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Phone = user.Phone,
                ProfilePictureUrl = user.ProfilePictureUrl,
                Role = user.Role.ToString(),
                GymId = user.GymId,
                AddressLine1 = user.Address?.Address1,
                AddressLine2 = user.Address?.Address2,
                City = user.Address?.City,
                State = user.Address?.State,
                ZipCode = user.Address?.PostalCode
            };
        }

        public async Task ChangePasswordAsync(Guid userId, ChangePasswordRequestDto dto)
        {
            User? user = await _authRepository.GetUserByIdAsync(userId);
            
            if (user == null)
                throw new Exception("User not found.");

            bool isValid = _passwordService.VerifyPasword(dto.CurrentPassword, user.PasswordHash!);
            if (!isValid)
                throw new Exception("Invalid current password.");

            user.PasswordHash = _passwordService.HashPassword(dto.NewPassword);
            user.ModifiedOn = DateTime.UtcNow;

            await _unitOfWork.SaveChangesAsync();
        }

        public async Task UpdateUserProfileAsync(Guid userId, UpdateUserProfileDto dto)
        {
            User? user = await _authRepository.GetUserByIdAsync(userId);
            
            if (user == null)
                throw new Exception("User not found.");

            // Delete old picture if changed
            if (!string.IsNullOrEmpty(user.ProfilePictureUrl) && 
                user.ProfilePictureUrl != dto.ProfilePictureUrl && 
                !user.ProfilePictureUrl.Contains("placeholder"))
            {
                await _fileStorageService.DeleteFileAsync(user.ProfilePictureUrl);
            }

            user.ModifiedOn = DateTime.UtcNow;
            bool isNewAddress = user.Address == null;
            _mapper.Map(dto, user);

            if (isNewAddress && user.Address != null)
            {
                user.Address.Id = Guid.NewGuid();
                user.Address.CreatedOn = DateTime.UtcNow;
                await _addressRepository.AddAsync(user.Address);
            }
            if (user.Address != null)
            {
                user.Address.ModifiedOn = DateTime.UtcNow;
                user.Address.ModifiedBy = userId;
            }

            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<UserProfileDto> GetMyProfileAsync()
        {
            Guid userId = _currentUserService.UserId ?? throw new Exception("Unauthorized access.");
            return await GetUserProfileAsync(userId);
        }

        public async Task UpdateMyProfileAsync(UpdateUserProfileDto dto)
        {
            Guid userId = _currentUserService.UserId ?? throw new Exception("Unauthorized access.");
            await UpdateUserProfileAsync(userId, dto);
        }

        public async Task ChangeMyPasswordAsync(ChangePasswordRequestDto dto)
        {
            Guid userId = _currentUserService.UserId ?? throw new Exception("Unauthorized access.");
            await ChangePasswordAsync(userId, dto);
        }

        public async Task<string> UploadAvatarAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is empty");

            using (Stream stream = file.OpenReadStream())
            {
                return await _fileStorageService.SaveFileAsync(stream, file.FileName, "avatars");
            }
        }
    }
}
