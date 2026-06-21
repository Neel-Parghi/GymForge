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
using GymForge.Contracts.Common;
using GymForge.Shared.Models;

namespace GymForge.Application.Modules.Users.Services
{
    public class UserService : IUserService
    {
        private readonly IAuthRepository _authRepository;
        private readonly IUserRepository _userRepository;
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
            IUserRepository userRepository,
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
            _userRepository = userRepository;
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
                Role = UserRole.GymOwner,
                IsActive = true,
                CreatedOn = DateTime.UtcNow,
                ModifiedOn = DateTime.UtcNow,
                Security = new UserSecurity
                {
                    InvitationToken = token,
                    InvitationExpiry = DateTime.UtcNow.AddDays(7),
                    IsInvitationAccepted = false,
                    IsEmailVerified = true
                },
                Profile = new UserProfile
                {
                    Phone = inviteOwnerRequestDto.Phone,
                    CreatedOn = DateTime.UtcNow,
                    ModifiedOn = DateTime.UtcNow
                }
            };

            await _authRepository.AddUserAsync(user);
            await _unitOfWork.SaveChangesAsync();

            await _emailService.SendInvitationEmailAsync(user.Email, $"{user.FirstName} {user.LastName}", token);
        }

        public async Task SetPasswordAsync(SetPasswordRequestDto setPasswordRequestDto)
        {
            User? user = await _authRepository.GetByTokenAsync(setPasswordRequestDto.Token);

            if (user == null || user.Security == null || user.Security.InvitationExpiry < DateTime.UtcNow)
                throw new Exception("The invitation link is invalid or has expired.");

            user.PasswordHash = _passwordService.HashPassword(setPasswordRequestDto.Password);
            user.Security.IsInvitationAccepted = true;
            user.Security.InvitationToken = null;
            user.Security.InvitationExpiry = null;
            user.ModifiedOn = DateTime.UtcNow;

            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<bool> ValidateInvitationTokenAsync(string token)
        {
            User? user = await _authRepository.GetByTokenAsync(token);
            return user != null && user.Security != null && user.Security.InvitationExpiry > DateTime.UtcNow;
        }

        public async Task ReInviteOwnerAsync(Guid userId)
        {
            User? user = await _userRepository.GetUserByIdAsync(userId);
            
            if (user == null)
                throw new Exception("User not found.");

            if (user.Security != null && user.Security.IsInvitationAccepted)
                throw new Exception("Invitation has already been accepted.");

            string token = Guid.NewGuid().ToString();
            user.Security ??= new UserSecurity { CreatedOn = DateTime.UtcNow };
            user.Security.InvitationToken = token;
            user.Security.InvitationExpiry = DateTime.UtcNow.AddDays(7);
            user.ModifiedOn = DateTime.UtcNow;

            await _unitOfWork.SaveChangesAsync();

            await _emailService.SendInvitationEmailAsync(user.Email, $"{user.FirstName} {user.LastName}", token);
        }

        public async Task<UserProfileDto> GetUserProfileAsync(Guid userId)
        {
            User? user = await _userRepository.GetUserByIdAsync(userId);
            
            if (user == null)
                throw new Exception("User not found.");

            return new UserProfileDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Phone = user.Profile?.Phone ?? string.Empty,
                ProfilePictureUrl = user.Profile?.ProfilePictureUrl ?? string.Empty,
                Role = user.Role.ToString(),
                GymId = user.GymId,
                IsOnboarded = user.Profile?.IsOnboarded ?? false,
                CurrentOnboardingStep = user.Profile?.CurrentOnboardingStep ?? 0,
                AddressLine1 = user.Profile?.Address?.Address1,
                AddressLine2 = user.Profile?.Address?.Address2,
                City = user.Profile?.Address?.City,
                State = user.Profile?.Address?.State,
                ZipCode = user.Profile?.Address?.PostalCode
            };
        }

        public async Task ChangePasswordAsync(Guid userId, ChangePasswordRequestDto dto)
        {
            User? user = await _userRepository.GetUserByIdAsync(userId);
            
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
            User? user = await _userRepository.GetUserByIdAsync(userId);
            
            if (user == null)
                throw new Exception("User not found.");

            user.Profile ??= new UserProfile { CreatedOn = DateTime.UtcNow };

            // Delete old picture if changed
            if (!string.IsNullOrEmpty(user.Profile.ProfilePictureUrl) && 
                user.Profile.ProfilePictureUrl != dto.ProfilePictureUrl && 
                !user.Profile.ProfilePictureUrl.Contains("placeholder"))
            {
                await _fileStorageService.DeleteFileAsync(user.Profile.ProfilePictureUrl);
            }

            user.ModifiedOn = DateTime.UtcNow;
            user.Profile.ModifiedOn = DateTime.UtcNow;

            user.FirstName = dto.FirstName;
            user.LastName = dto.LastName;
            user.Profile.Phone = dto.Phone ?? string.Empty;
            user.Profile.ProfilePictureUrl = dto.ProfilePictureUrl ?? string.Empty;

            bool isNewAddress = user.Profile.Address == null;

            if (isNewAddress)
            {
                user.Profile.Address = new Address
                {
                    Id = Guid.NewGuid(),
                    Address1 = dto.AddressLine1 ?? string.Empty,
                    Address2 = dto.AddressLine2 ?? string.Empty,
                    City = dto.City ?? string.Empty,
                    State = dto.State ?? string.Empty,
                    PostalCode = dto.ZipCode ?? string.Empty,
                    CreatedOn = DateTime.UtcNow
                };
                await _addressRepository.AddAsync(user.Profile.Address);
                user.Profile.AddressId = user.Profile.Address.Id;
            }
            else if (user.Profile.Address != null)
            {
                user.Profile.Address.Address1 = dto.AddressLine1 ?? string.Empty;
                user.Profile.Address.Address2 = dto.AddressLine2 ?? string.Empty;
                user.Profile.Address.City = dto.City ?? string.Empty;
                user.Profile.Address.State = dto.State ?? string.Empty;
                user.Profile.Address.PostalCode = dto.ZipCode ?? string.Empty;
                user.Profile.Address.ModifiedOn = DateTime.UtcNow;
                user.Profile.Address.ModifiedBy = userId;
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

        public async Task<IEnumerable<DeletionRequestDto>> GetPendingDeletionRequestsAsync()
        {
            IEnumerable<User> users = await _userRepository.GetPendingDeletionRequestsAsync();

            return [.. users.Select(u => new DeletionRequestDto
            {
                UserId = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email,
                Role = u.Role.ToString(),
                DeletionRequestedOn = u.Security!.DeletionRequestedOn!.Value,
                ScheduledDeletionTime = u.Security!.DeletionRequestedOn!.Value.AddHours(24)
            })];
        }

        public async Task<PagedResponse<StandaloneUserDto>> GetStandaloneUsersAsync(PaginationParams pagination)
        {
            (IEnumerable<User> Items, int TotalCount) result = await _userRepository.GetStandaloneUsersAsync(pagination.PageNumber, pagination.PageSize, pagination.SearchTerm);

            IEnumerable<StandaloneUserDto> items = result.Items.Select(u => new StandaloneUserDto
            {
                Id = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email,
                Phone = u.Profile?.Phone ?? string.Empty,
                ProfilePictureUrl = u.Profile?.ProfilePictureUrl ?? string.Empty,
                Role = u.Role.ToString(),
                CreatedOn = u.CreatedOn,
                DeletionRequestedOn = u.Security?.DeletionRequestedOn,
                IsEmailVerified = u.Security?.IsEmailVerified ?? false
            });

            return new PagedResponse<StandaloneUserDto>(items, result.TotalCount, pagination.PageNumber, pagination.PageSize);
        }
        
        public async Task SaveOnboardingStepAsync(Guid userId, int step)
        {
            User? user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null) throw new Exception("User not found.");

            user.Profile ??= new UserProfile { CreatedOn = DateTime.UtcNow };
            user.Profile.CurrentOnboardingStep = step;
            await _userRepository.UpdateUserAsync(user);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task CompleteUserOnboardingAsync(Guid userId, CompleteUserOnboardingDto dto)
        {
            User? user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null) throw new Exception("User not found.");

            user.Profile ??= new UserProfile { CreatedOn = DateTime.UtcNow };
            user.Profile.IsOnboarded = true;
            user.Profile.CurrentOnboardingStep = 3;

            user.Profile ??= new UserProfile { CreatedOn = DateTime.UtcNow };
            user.Preference ??= new UserPreference { CreatedOn = DateTime.UtcNow };

            user.Profile.DateOfBirth = dto.DOB;
            if (Enum.TryParse<Gender>(dto.Gender, true, out var genderEnum))
            {
                user.Profile.Gender = genderEnum;
            }

            if (dto.TargetWeight.HasValue)
            {
                user.Preference.TargetWeight = (double)dto.TargetWeight.Value;
            }
            user.Preference.PrimaryGoal = dto.PrimaryGoal;

            var measurement = new MemberMeasurement
            {
                UserId = user.Id,
                Height = (double)dto.Height,
                Weight = (double)dto.Weight,
                Date = DateTime.UtcNow,
                CreatedOn = DateTime.UtcNow,
                IsAdvanced = false
            };

            user.Measurements ??= new List<MemberMeasurement>();
            user.Measurements.Add(measurement);

            await _userRepository.UpdateUserAsync(user);
            await _unitOfWork.SaveChangesAsync();
        }
    }
}
