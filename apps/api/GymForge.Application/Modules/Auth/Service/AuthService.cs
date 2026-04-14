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

            if (user == null || user.RefreshTokenExpiry < DateTime.UtcNow)
                throw new Exception("Invalid or expired refresh token");

            return await GenerateAndSaveTokens(user);
        }

        private async Task<TokenResponseDto> GenerateAndSaveTokens(User user)
        {
            TokenResponseDto tokenResponse = _jwtService.GenerateToken(user);

            user.RefreshToken = tokenResponse.RefreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);

            await _unitOfWork.SaveChangesAsync();

            return tokenResponse;
        }
    }
}
