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

        public AuthService(IPasswordService passwordService, IJwtService jwtService, IAuthRepository authRepository, IUnitOfWork unitOfWork)
        {
            _passwordService = passwordService;
            _jwtService = jwtService;
            _authRepository = authRepository;
            _unitOfWork = unitOfWork;
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

        public async Task<TokenResponseDto> Login(LoginRequestDto userDto)
        {
            User? user = await _authRepository.Login(userDto);

            if (user == null)
                throw new Exception("Invalid credentials");

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
                    return new TokenResponseDto
                    {
                        AccessToken = _jwtService.GenerateToken(user).AccessToken,
                        RefreshToken = replacement.Token
                    };
                }
            }

            TokenResponseDto newTokens = _jwtService.GenerateToken(user);
            
            refreshToken.Revoked = DateTime.UtcNow;
            refreshToken.GracePeriodExpires = DateTime.UtcNow.AddSeconds(60);
            refreshToken.ReplacedByToken = newTokens.RefreshToken;

            return await SaveTokens(user, newTokens);
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

        private async Task<TokenResponseDto> GenerateAndSaveTokens(User user)
        {
            // Optional: Strict single-session policy - remove all other active tokens for this user
            // List<RefreshToken> activeTokens = [.. user.RefreshTokens.Where(t => t.IsActive)];
            // foreach (var t in activeTokens) user.RefreshTokens.Remove(t);

            TokenResponseDto tokenResponse = _jwtService.GenerateToken(user);
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
