using GymForge.Domain.Interface;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace GymForge.Infrastructure.Services
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor) 
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public Guid? UserId
        {
            get
            {
                var httpContext = _httpContextAccessor.HttpContext;
                if (httpContext == null) return null;

                var user = httpContext.User;
                
                var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                                  ?? user.FindFirst("userId")?.Value 
                                  ?? user.FindFirst("uid")?.Value;

                if (Guid.TryParse(userIdClaim, out var userId))
                {
                    return userId;
                }

                return null;
            }
        } 
    }
}
