using GymForge.Contracts.Auth;
using GymForge.Domain.Entities;
using GymForge.Domain.Interface;
using GymForge.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GymForge.Infrastructure.Repositories
{
    public class AuthRepository : IAuthRepository
    { 
        private readonly AppDbContext _context;

        public AuthRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task RegisterSuperAdmin(User user)
        {
            await _context.Users.AddAsync(user);
        }

        public async Task AddUserAsync(User user)
        {
            await _context.Users.AddAsync(user);
        }

        public async Task<User?> Login(LoginRequestDto userRequest)
        {
            User? user = await _context.Users.FirstOrDefaultAsync(x => x.Email == userRequest.Email);

            return user;
        }

        public async Task<User?> GetByTokenAsync(string token)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.InvitationToken == token);
        }

        public async Task<User?> GetUserByIdAsync(Guid userId)
        {
            return await _context.Users.FindAsync(userId);
        }

        public async Task<User?> GetByRefreshTokenAsync(string refreshToken)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);
        }
    }
}
