using GymForge.Application.Modules.Auth.Interface;
using GymForge.Contracts.Auth;
using GymForge.Domain.Entities;
using GymForge.Shared.Enums;
using GymForge.Domain.Interface;

namespace GymForge.Application.Modules.Auth.Service
{
    public class AuthService : IAuthService
    {
        private readonly IPasswordService _passwordService;
        private readonly IJwtService _jwtService;
        private readonly IAuthRepository _authRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEmailService _emailService;

        public AuthService(IPasswordService passwordService, IJwtService jwtService, IAuthRepository authRepository, IUnitOfWork unitOfWork, IEmailService emailService)
        {
            _passwordService = passwordService;
            _jwtService = jwtService;
            _authRepository = authRepository;
            _unitOfWork = unitOfWork;
            _emailService = emailService;
        }

        public async Task<TokenResponseDto> RegisterSuperAdmin(RegisterRequestDto userDto)
        {
            User user = new()
            {
                FirstName = userDto.FirstName,
                LastName = userDto.LastName,
                Email = userDto.Email,
                PasswordHash = _passwordService.HashPassword(userDto.Password),
                Phone = userDto.Phone,
                Role = UserRole.SuperAdmin,
                IsActive = true
            };

            await _authRepository.RegisterSuperAdmin(user);
            await _unitOfWork.SaveChangesAsync();

            return await GenerateAndSaveTokens(user);
        }

        public async Task<RegisterResponseDto> RegisterAsync(RegisterRequestDto userDto)
        {
            if (userDto.Role != UserRole.User && userDto.Role != UserRole.GymOwner)
            {
                throw new Exception("Invalid role for registration. Only User or GymOwner roles are allowed.");
            }

            User? existingUser = await _authRepository.GetByUserByEmailAsync(userDto.Email);
            if (existingUser != null)
            {
                if (!existingUser.IsEmailVerified)
                {
                    // Allow re-registering or just regenerating OTP if email is not verified
                    string existingOtp = new Random().Next(100000, 999999).ToString();
                    existingUser.OtpCode = existingOtp;
                    existingUser.OtpExpiry = DateTime.UtcNow.AddMinutes(10);
                    
                    await _unitOfWork.SaveChangesAsync();
                    await _emailService.SendOtpEmailAsync(existingUser.Email, existingUser.FirstName, existingOtp);
                    
                    return new RegisterResponseDto { Message = "OTP sent to email.", RequiresOtp = true, Email = existingUser.Email };
                }
                throw new Exception("A user with this email already exists.");
            }

            string otp = new Random().Next(100000, 999999).ToString();

            User user = new()
            {
                FirstName = userDto.FirstName,
                LastName = userDto.LastName ?? string.Empty,
                Email = userDto.Email,
                PasswordHash = _passwordService.HashPassword(userDto.Password),
                Phone = userDto.Phone ?? string.Empty,
                Role = userDto.Role,
                IsActive = true,
                IsEmailVerified = false,
                OtpCode = otp,
                OtpExpiry = DateTime.UtcNow.AddMinutes(10)
            };

            await _authRepository.AddUserAsync(user);
            await _authRepository.LinkUserToGymMembersAsync(user);
            await _unitOfWork.SaveChangesAsync();

            await _emailService.SendOtpEmailAsync(user.Email, user.FirstName, otp);

            return new RegisterResponseDto { Message = "OTP sent to email.", RequiresOtp = true, Email = user.Email };
        }

        public async Task<TokenResponseDto> VerifyOtpAsync(VerifyOtpRequestDto dto)
        {
            User? user = await _authRepository.GetByUserByEmailAsync(dto.Email);
            if (user == null)
                throw new Exception("User not found.");
            
            if (user.IsEmailVerified)
                throw new Exception("Email is already verified.");
                
            if (user.OtpCode != dto.OtpCode || user.OtpExpiry < DateTime.UtcNow)
                throw new Exception("Invalid or expired OTP code.");
                
            user.IsEmailVerified = true;
            user.OtpCode = null;
            user.OtpExpiry = null;
            
            await _unitOfWork.SaveChangesAsync();
            
            return await GenerateAndSaveTokens(user);
        }

        public async Task<bool> ResendOtpAsync(ResendOtpRequestDto dto)
        {
            User? user = await _authRepository.GetByUserByEmailAsync(dto.Email);
            if (user == null)
                throw new Exception("User not found.");
                
            if (user.IsEmailVerified)
                throw new Exception("Email is already verified.");
                
            string otp = new Random().Next(100000, 999999).ToString();
            user.OtpCode = otp;
            user.OtpExpiry = DateTime.UtcNow.AddMinutes(10);
            
            await _unitOfWork.SaveChangesAsync();
            await _emailService.SendOtpEmailAsync(user.Email, user.FirstName, otp);
            
            return true;
        }

        public async Task<TokenResponseDto> Login(LoginRequestDto userDto)
        {
            User? user = await _authRepository.Login(userDto);

            if (user == null)
                throw new Exception("Invalid credentials");

            if (!user.IsEmailVerified)
                throw new Exception("EMAIL_NOT_VERIFIED");

            bool validPassword = _passwordService.VerifyPasword(userDto.Password, user.PasswordHash!);

            if (!validPassword)
                throw new Exception("Invalid credentials");

            return await GenerateAndSaveTokens(user);
        }

        public async Task<TokenResponseDto> RefreshTokenAsync(RefreshTokenRequestDto dto)
        {
            User? user = await _authRepository.GetByRefreshTokenAsync(dto.RefreshToken);
            RefreshToken? refreshToken = user?.RefreshTokens.FirstOrDefault(x => x.Token == dto.RefreshToken);

            if (user == null || refreshToken == null || !refreshToken.IsActive)
                throw new Exception("Invalid or expired refresh token");

            if (refreshToken.Revoked != null && !string.IsNullOrEmpty(refreshToken.ReplacedByToken))
            {
                RefreshToken? replacement = user.RefreshTokens.FirstOrDefault(rt => rt.Token == refreshToken.ReplacedByToken);
                if (replacement != null && replacement.IsActive)
                {
                    Guid? branchId = await ResolveBranchIdAsync(user);
                    return new TokenResponseDto
                    {
                        AccessToken = _jwtService.GenerateToken(user, branchId).AccessToken,
                        RefreshToken = replacement.Token
                    };
                }
            }

            Guid? activeBranchId = await ResolveBranchIdAsync(user);
            TokenResponseDto newTokens = _jwtService.GenerateToken(user, activeBranchId);
            
            refreshToken.Revoked = DateTime.UtcNow;
            refreshToken.GracePeriodExpires = DateTime.UtcNow.AddSeconds(60);
            refreshToken.ReplacedByToken = newTokens.RefreshToken;

            return await SaveTokens(user, newTokens);
        }

        public async Task ForgotPasswordAsync(ForgotPasswordRequestDto dto)
        {
            User? user = await _authRepository.GetByUserByEmailAsync(dto.Email);
            if (user == null)
                return;
                
            string token = Guid.NewGuid().ToString("N");
            user.OtpCode = token;
            user.OtpExpiry = DateTime.UtcNow.AddMinutes(10);
            
            await _unitOfWork.SaveChangesAsync();
            
            string resetLink = $"{dto.ClientUri.TrimEnd('/')}?email={Uri.EscapeDataString(user.Email)}&token={token}";
            await _emailService.SendPasswordResetLinkEmailAsync(user.Email, user.FirstName, resetLink);
        }

        public async Task ResetPasswordAsync(ResetPasswordRequestDto dto)
        {
            User? user = await _authRepository.GetByUserByEmailAsync(dto.Email);
            if (user == null)
                throw new Exception("Invalid or expired reset token.");

            if (user.OtpCode != dto.Token || user.OtpExpiry < DateTime.UtcNow)
                throw new Exception("Invalid or expired reset token.");

            user.PasswordHash = _passwordService.HashPassword(dto.NewPassword);
            user.OtpCode = null;
            user.OtpExpiry = null;
            
            user.RefreshTokens.Clear();

            await _unitOfWork.SaveChangesAsync();
        }

        public async Task LogoutAsync(string refreshToken)
        {
            User? user = await _authRepository.GetByRefreshTokenAsync(refreshToken);
            RefreshToken? token = user?.RefreshTokens.FirstOrDefault(rt => rt.Token == refreshToken);

            if (token != null)
            {
                user!.RefreshTokens.Remove(token);
                await _unitOfWork.SaveChangesAsync();
            }
        }

        private async Task<Guid?> ResolveBranchIdAsync(User user)
        {
            if (user.Role == UserRole.Staff || user.Role == UserRole.Trainer)
            {
                return await _authRepository.GetBranchIdByUserIdAsync(user.Id);
            }
            return null;
        }

        private async Task<TokenResponseDto> GenerateAndSaveTokens(User user)
        {
            // Optional: Strict single-session policy - remove all other active tokens for this user
            // List<RefreshToken> activeTokens = [.. user.RefreshTokens.Where(t => t.IsActive)];
            // foreach (var t in activeTokens) user.RefreshTokens.Remove(t);

            Guid? branchId = await ResolveBranchIdAsync(user);
            TokenResponseDto tokenResponse = _jwtService.GenerateToken(user, branchId);
            return await SaveTokens(user, tokenResponse);
        }

        private async Task<TokenResponseDto> SaveTokens(User user, TokenResponseDto tokenResponse)
        {
            RefreshToken refreshToken = new()
            {
                Token = tokenResponse.RefreshToken,
                Expires = DateTime.UtcNow.AddDays(7),
                UserId = user.Id,
                CreatedOn = DateTime.UtcNow,
                CreatedBy = user.Id
            };

            user.RefreshTokens.Add(refreshToken);
            
            List<RefreshToken> staleTokens = [.. user.RefreshTokens.Where(t => t.Id != Guid.Empty && !t.IsActive)];

            foreach (RefreshToken stale in staleTokens)
            {
                user.RefreshTokens.Remove(stale);
            }

            await _unitOfWork.SaveChangesAsync();

            return tokenResponse;
        }
    }
}
