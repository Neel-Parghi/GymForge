using GymForge.Application.Modules.Auth.Interface;
using GymForge.Contracts.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;

namespace GymForge.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        // [HttpPost("register-superadmin")]
        // public async Task<IActionResult> RegisterSuperAdmin(RegisterRequestDto dto)
        // {
        //     TokenResponseDto response = await _authService.RegisterSuperAdmin(dto);
        //     return Ok(response);
        // }

        [HttpPost("register")]
        [EnableRateLimiting("OtpPolicy")]
        public async Task<IActionResult> Register(RegisterRequestDto dto)
        {
            try
            {
                RegisterResponseDto response = await _authService.RegisterAsync(dto);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("verify-otp")]
        [EnableRateLimiting("OtpPolicy")]
        public async Task<IActionResult> VerifyOtp(VerifyOtpRequestDto dto)
        {
            try
            {
                TokenResponseDto response = await _authService.VerifyOtpAsync(dto);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("resend-otp")]
        [EnableRateLimiting("OtpPolicy")]
        public async Task<IActionResult> ResendOtp(ResendOtpRequestDto dto)
        {
            try
            {
                await _authService.ResendOtpAsync(dto);
                return Ok(new { message = "OTP resent successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequestDto dto)
        {
            TokenResponseDto response = await _authService.Login(dto);
            return Ok(response);
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh(RefreshTokenRequestDto dto)
        {
            try
            {
                TokenResponseDto response = await _authService.RefreshTokenAsync(dto);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout(RefreshTokenRequestDto dto)
        {
            await _authService.LogoutAsync(dto.RefreshToken);
            return NoContent();
        }

        [Authorize]
        [HttpGet("me")]
        public IActionResult Me()
        {
            string? userId = User.FindFirst("userId")?.Value;
            string? email = User.FindFirst(ClaimTypes.Email)?.Value;
            string? role = User.FindFirst(ClaimTypes.Role)?.Value;

            return Ok(new { userId, email, role });
        }
    }
}
