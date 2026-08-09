using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace GymForge.Api.Middlewares
{
    public class DemoModeMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly string _demoUserEmail = "demo@gymforge.com"; // Set your desired demo credentials here

        public DemoModeMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (context.User.Identity?.IsAuthenticated == true)
            {
                var emailClaim = context.User.FindFirst(ClaimTypes.Email)?.Value;

                if (!string.IsNullOrEmpty(emailClaim) && emailClaim.Equals(_demoUserEmail, System.StringComparison.OrdinalIgnoreCase))
                {
                    var method = context.Request.Method;

                    // Allow only GET and HEAD requests for the demo user, except for authentication endpoints if needed.
                    if (method == HttpMethods.Post || method == HttpMethods.Put || method == HttpMethods.Delete || method == HttpMethods.Patch)
                    {
                        // Exclude authentication paths if we want demo users to be able to login/logout normally, though they are already authenticated here.
                        var path = context.Request.Path.Value?.ToLower();
                        if (path != null && !path.Contains("/api/auth"))
                        {
                            context.Response.StatusCode = StatusCodes.Status403Forbidden;
                            context.Response.ContentType = "application/json";
                            await context.Response.WriteAsync("{\"message\": \"This action is disabled in Demo Mode.\", \"isSuccess\": false}");
                            return;
                        }
                    }
                }
            }

            await _next(context);
        }
    }
}
