using GymForge.Application.Modules.Auth.Interface;
using GymForge.Contracts.Auth;
using GymForge.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace GymForge.Application.Modules.Auth.Service
{
    public class JwtService : IJwtService
    {
        private readonly IConfiguration _config;

        public JwtService(IConfiguration config)
        {
            _config = config;
        }

        public TokenResponseDto GenerateToken(User user, Guid? branchId = null)
        {
            List<Claim> claims = new()
            {
                new Claim("userId", user.Id.ToString()),
                new Claim("email", user.Email),
                new Claim("role", user.Role.ToString()),
                new Claim("gymId", user.GymId?.ToString() ?? string.Empty),
            };

            if (branchId.HasValue)
            {
                claims.Add(new Claim("branchId", branchId.Value.ToString()));
            }

            SymmetricSecurityKey key = new (Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            SigningCredentials creds = new (key, SecurityAlgorithms.HmacSha256);

            JwtSecurityToken token = new (
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(15),
                signingCredentials: creds
            );

            return new TokenResponseDto
            {
                AccessToken = new JwtSecurityTokenHandler().WriteToken(token),
                RefreshToken = GenerateRefreshToken()
            };
        }

        public string GenerateRefreshToken()
        {
            byte[] randomNumber = new byte[64];
            using RandomNumberGenerator rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }
    }
}
