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
        
        public DbSet<SubscriptionRecord> SubscriptionRecords { get; set; }
        
        public DbSet<RefreshToken> RefreshTokens { get; set; }

        public DbSet<SaaSPaymentTransaction> SaaSPaymentTransactions { get; set; }
        
        public DbSet<SaaSConfiguration> SaaSConfigurations { get; set; }
        
        public DbSet<GymPlan> GymPlans { get; set; }
        
        public DbSet<GymMember> GymMembers { get; set; }
        
        public DbSet<MemberSubscription> MemberSubscriptions { get; set; }

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

            modelBuilder.Entity<GymPlan>()
                .Property(p => p.Price)
                .HasPrecision(18, 2);

            modelBuilder.Entity<GymPlan>()
                .Property(p => p.DiscountedPrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<SubscriptionRecord>()
                .Property(x => x.PriceAtPurchase)
                .HasPrecision(18, 2);

            modelBuilder.Entity<SaaSPaymentTransaction>()
                .Property(x => x.Amount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<SaaSConfiguration>(entity =>
            {
                entity.Property(x => x.TaxPercentage).HasPrecision(5, 2);
                entity.Property(x => x.YearlyRevenueTarget)
                      .HasColumnName("MonthlyRevenueTarget")
                      .HasPrecision(18, 2);
                entity.Property(x => x.SubscriptionTarget);
                entity.Property(x => x.UptimeThreshold).HasPrecision(5, 2);
            });

            // Seed default settings
            modelBuilder.Entity<SaaSConfiguration>().HasData(new SaaSConfiguration
            {
                Id = Guid.Parse("A1B2C3D4-E5F6-4A5B-8C9D-0E1F2A3B4C5D"),
                PlatformName = "GymForge",
                BillingEmail = "admin@gymforge.com",
                TaxPercentage = 18.0m,
                GracePeriodDays = 7,
                Currency = "INR",
                CreatedOn = new DateTime(2026, 4, 25, 0, 0, 0, DateTimeKind.Utc),
                CreatedBy = Guid.Empty
            });
        }
    }
}
