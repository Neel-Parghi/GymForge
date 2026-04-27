using GymForge.Domain.Interface;
using GymForge.Infrastructure.Persistence;
using GymForge.Infrastructure.Persistence.Interceptos;
using GymForge.Infrastructure.Repositories;
using GymForge.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace GymForge.Infrastructure
{
    public static class DIConfig
    {
        public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddHttpClient();
            services.AddHttpContextAccessor();

            services.AddDbContext<AppDbContext>((sp, options) =>
            {
                var connectionString = configuration.GetConnectionString("DefaultConnection");
                AuditableEntityInterceptor? auditableInterceptor = sp.GetService<AuditableEntityInterceptor>();

                if (string.IsNullOrEmpty(connectionString))
                {
                    connectionString = "Host=localhost;Database=dummy;Username=postgres;Password=password";
                }

                if (connectionString.Contains("Host=") || connectionString.Contains("port=") || connectionString.Contains("postgres"))
                {
                    options.UseNpgsql(connectionString,
                        sqlOptions => sqlOptions.EnableRetryOnFailure());
                }
                else
                {
                    options.UseSqlServer(connectionString,
                        sqlOptions => sqlOptions.EnableRetryOnFailure());
                }

                if (auditableInterceptor != null)
                {
                    options.AddInterceptors(auditableInterceptor);
                }
            });

            services.AddScoped<ICurrentUserService, CurrentUserService>();
            services.AddScoped<AuditableEntityInterceptor>();
            services.AddScoped<IAuthRepository, AuthRepository>();
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped<IGymManagementRepository, GymManagementRepository>();
            services.AddScoped<ISaaSPlanRepository, SaaSPlanRepository>();
            services.AddScoped<ISaaSPaymentRepository, SaaSPaymentRepository>();
            services.AddScoped<ISaaSConfigurationRepository, SaaSConfigurationRepository>();
            services.AddScoped<IDashboardRepository, DashboardRepository>();
            services.AddScoped<IEmailService, Services.BrevoEmailService>();
            var cloudName = configuration["Cloudinary:CloudName"];
            if (!string.IsNullOrEmpty(cloudName))
            {
                services.AddScoped<IFileStorageService, CloudinaryFileStorageService>();
            }
            else
            {
                services.AddScoped<IFileStorageService, LocalFileStorageService>();
            }

            return services;
        }
    }
}
