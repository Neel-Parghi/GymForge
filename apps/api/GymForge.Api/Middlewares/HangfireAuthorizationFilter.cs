using Hangfire.Dashboard;

namespace GymForge.Api.Middlewares
{
    public class HangfireAuthorizationFilter : IDashboardAuthorizationFilter
    {
        public bool Authorize(DashboardContext context)
        {
            var httpContext = context.GetHttpContext();
        
            return true; 
        }
    }
}
