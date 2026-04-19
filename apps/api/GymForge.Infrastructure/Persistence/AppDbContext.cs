using GymForge.Domain.Entities;
using Microsoft.EntityFrameworkCore;


namespace GymForge.Infrastructure.Persistence
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {

        }

        public DbSet<User> Users { get; set; }

        public DbSet<Gym> Gyms { get; set; }

        public DbSet<Address> Addresses { get; set; }

        public DbSet<Plan> Plans { get; set; }
        
        public DbSet<Branch> Branches { get; set; }
        
        public DbSet<GymSubscription> GymSubscriptions { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<RefreshToken>(entity =>
            {
                entity.HasOne(rt => rt.User)
                      .WithMany(u => u.RefreshTokens)
                      .HasForeignKey(rt => rt.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                
                entity.HasIndex(rt => rt.Token);
            });

            modelBuilder.Entity<Plan>()
                .Property(x => x.Price)
                .HasPrecision(18, 2);

            modelBuilder.Entity<GymSubscription>()
                .Property(x => x.PriceAtPurchase)
                .HasPrecision(18, 2);
        }
    }
}
