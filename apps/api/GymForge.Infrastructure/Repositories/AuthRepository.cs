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
            User? user = await _context.Users
                .Include(x => x.RefreshTokens)
                .FirstOrDefaultAsync(x => x.Email == userRequest.Email);

            return user;
        }

        public async Task<User?> GetByTokenAsync(string token)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.InvitationToken == token);
        }

        public async Task<User?> GetUserByIdAsync(Guid userId)
        {
            return await _context.Users
                .Include(u => u.Address)
                .FirstOrDefaultAsync(u => u.Id == userId);
        }

        public async Task<User?> GetByRefreshTokenAsync(string refreshToken)
        {
            RefreshToken? token = await _context.RefreshTokens
                .Include(rt => rt.User)
                .ThenInclude(u => u.RefreshTokens)
                .FirstOrDefaultAsync(rt => rt.Token == refreshToken);
            
            return token?.User;
        }

        public async Task<User?> GetByUserByEmailAsync(string email)
        {
            return await _context.Users
                .Include(u => u.RefreshTokens)
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<Guid?> GetBranchIdByUserIdAsync(Guid userId)
        {
            return await _context.Staff
                .Where(s => s.UserId == userId && s.IsActive)
                .Select(s => s.BranchId)
                .FirstOrDefaultAsync();
        }

        public async Task LinkUserToGymMembersAsync(User user)
        {
            string emailLower = user.Email.ToLower();
            List<GymMember> unlinkedMembers = await _context.GymMembers
                .Where(m => m.Email.ToLower() == emailLower && m.UserId == null)
                .ToListAsync();

            foreach (GymMember member in unlinkedMembers)
            {
                member.UserId = user.Id;
            }
        }
    }
}
