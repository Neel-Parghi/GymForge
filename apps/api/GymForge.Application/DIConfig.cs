using GymForge.Application.Modules.Auth.Interface;
using GymForge.Application.Modules.Auth.Service;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace GymForge.Application
{
    public static class DIConfig
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddScoped<IAuthService, AuthService>();

            services.AddScoped<IJwtService, JwtService>();

            services.AddScoped<IPasswordService, PasswordService>();


            return services;
        }
    }
}
