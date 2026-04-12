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

        public async Task<string> RegisterSuperAdmin(RegisterRequestDto userDto)
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

            return _jwtService.GenerateToken(user);

        }

        public async Task<string> Login(LoginRequestDto userDto)
        {
            User? user = await _authRepository.Login(userDto);

            if (user == null)
                throw new Exception("Invalid credentials");

            bool validPassword = _passwordService.VerifyPasword(userDto.Password, user.PasswordHash);

            if (!validPassword)
                throw new Exception("Invalid credentials");
            
            return _jwtService.GenerateToken(user);
        }
    }
}
