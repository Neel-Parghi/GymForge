using GymForge.Application.Modules.Dev.Interface;
using GymForge.Domain.Entities;
using GymForge.Domain.Interface;
using GymForge.Infrastructure.Persistence;
using GymForge.Shared.Enums;
using GymForge.Application.Modules.Auth.Interface;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace GymForge.Infrastructure.Services
{
    public class DatabaseSeederService : IDatabaseSeederService
    {
        private readonly AppDbContext _dbContext;
        private readonly IPasswordService _passwordService;

        public DatabaseSeederService(AppDbContext dbContext, IPasswordService passwordService)
        {
            _dbContext = dbContext;
            _passwordService = passwordService;
        }

        public async Task SeedAsync()
        {
            // Clear all data (Order matters for foreign keys)
            _dbContext.UserSecurities.RemoveRange(_dbContext.UserSecurities);
            _dbContext.UserProfiles.RemoveRange(_dbContext.UserProfiles);
            _dbContext.UserPreferences.RemoveRange(_dbContext.UserPreferences);
            _dbContext.Users.RemoveRange(_dbContext.Users);
            
            _dbContext.SubscriptionRecords.RemoveRange(_dbContext.SubscriptionRecords);
            _dbContext.GymMembers.RemoveRange(_dbContext.GymMembers);
            _dbContext.Gyms.RemoveRange(_dbContext.Gyms);
            
            await _dbContext.SaveChangesAsync();

            // 1. Super Admin
            User superAdmin = new User
            {
                Id = Guid.NewGuid(),
                Email = "SuperAdmin@gymforge.com",
                FirstName = "Super",
                LastName = "Admin",
                PasswordHash = _passwordService.HashPassword("SAdmin@19"),
                Role = UserRole.SuperAdmin,
                IsActive = true,
                CreatedOn = DateTime.UtcNow,
                Profile = new UserProfile
                {
                    Id = Guid.NewGuid(),
                    IsOnboarded = true,
                    CurrentOnboardingStep = 5,
                    Phone = "1111111111"
                },
                Security = new UserSecurity
                {
                    Id = Guid.NewGuid(),
                    IsEmailVerified = true,
                    CreatedOn = DateTime.UtcNow
                }
            };

            // 2. Demo Owner
            Guid ownerGymId = Guid.NewGuid();
            User demoOwner = new User
            {
                Id = Guid.NewGuid(),
                Email = "demo@gymforge.com",
                FirstName = "Demo",
                LastName = "Owner",
                PasswordHash = _passwordService.HashPassword("GymOwner@19"),
                Role = UserRole.GymOwner,
                IsActive = true,
                CreatedOn = DateTime.UtcNow,
                GymId = ownerGymId,
                Profile = new UserProfile
                {
                    Id = Guid.NewGuid(),
                    IsOnboarded = true,
                    CurrentOnboardingStep = 5,
                    Phone = "2222222222"
                },
                Security = new UserSecurity
                {
                    Id = Guid.NewGuid(),
                    IsEmailVerified = true,
                    CreatedOn = DateTime.UtcNow
                }
            };

            Gym demoGym = new Gym
            {
                Id = ownerGymId,
                GymName = "Demo Gym",
                OwnerUserId = demoOwner.Id,
                CreatedOn = DateTime.UtcNow,
                Configuration = new GymConfiguration { Id = Guid.NewGuid() }
            };

            // 3. Demo User
            User demoUser = new User
            {
                Id = Guid.NewGuid(),
                Email = "demouser@gymforge.com",
                FirstName = "Demo",
                LastName = "User",
                PasswordHash = _passwordService.HashPassword("DemoUser@19"),
                Role = UserRole.User,
                IsActive = true,
                CreatedOn = DateTime.UtcNow,
                GymId = ownerGymId,
                Profile = new UserProfile
                {
                    Id = Guid.NewGuid(),
                    IsOnboarded = true,
                    CurrentOnboardingStep = 5,
                    Phone = "3333333333"
                },
                Security = new UserSecurity
                {
                    Id = Guid.NewGuid(),
                    IsEmailVerified = true,
                    CreatedOn = DateTime.UtcNow
                }
            };
            
            GymMember demoMember = new GymMember
            {
                Id = Guid.NewGuid(),
                UserId = demoUser.Id,
                GymId = ownerGymId,
                FirstName = demoUser.FirstName,
                LastName = demoUser.LastName,
                Email = demoUser.Email,
                Status = MemberStatus.Active,
                JoiningDate = DateTime.UtcNow,
                CreatedOn = DateTime.UtcNow,
                MembershipNumber = "DEMO-001"
            };

            Plan proPlan = new Plan
            {
                Id = Guid.Parse("019fda58-8f8b-7aa4-a053-6f56b38f8d12"),
                Name = "Pro Tier Monthly",
                Description = "",
                Price = 499.00m,
                DurationInDays = 30,
                MaxBranches = 5,
                MaxMembers = 1000,
                IsActive = true,
                IsTrial = false,
                CreatedOn = DateTime.UtcNow
            };

            SubscriptionRecord demoSubscription = new SubscriptionRecord
            {
                Id = Guid.NewGuid(),
                GymId = ownerGymId,
                PlanId = proPlan.Id,
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddYears(10),
                IsActive = true,
                IsTrial = false,
                PriceAtPurchase = 499.00m,
                Notes = "Auto-assigned by Seeder",
                CreatedOn = DateTime.UtcNow
            };

            // Add if plan doesn't exist
            if (!await _dbContext.Plans.AnyAsync(p => p.Id == proPlan.Id))
            {
                await _dbContext.Plans.AddAsync(proPlan);
            }

            await _dbContext.Users.AddRangeAsync(superAdmin, demoOwner, demoUser);
            await _dbContext.Gyms.AddAsync(demoGym);
            await _dbContext.GymMembers.AddAsync(demoMember);
            await _dbContext.SubscriptionRecords.AddAsync(demoSubscription);
            
            await _dbContext.SaveChangesAsync();
        }
    }
}
