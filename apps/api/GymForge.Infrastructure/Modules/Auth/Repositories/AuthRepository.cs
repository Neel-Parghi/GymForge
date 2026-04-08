using GymForge.Contracts.Auth;
using GymForge.Domain.Entities;
using GymForge.Application.Modules.Auth.Interface;
using GymForge.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GymForge.Infrastructure.Modules.Auth.Repositories
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
            await _context.SaveChangesAsync();
        }

        public async Task<User?> Login(LoginRequestDto userRequest)
        {
            User? user = await _context.Users.FirstOrDefaultAsync(x => x.Email == userRequest.Email);

            return user;
        }

    }
}
