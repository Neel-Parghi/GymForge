using GymForge.Api.Filters;
using Microsoft.AspNetCore.Mvc;

namespace GymForge.Api.Controllers
{
    [ApiController]
    [RequireActiveSubscription]
    public abstract class BaseApiController : ControllerBase
    {
        protected Guid UserId
        {
            get
            {
                string? id = User.FindFirst("userId")?.Value;
                return string.IsNullOrEmpty(id) ? Guid.Empty : Guid.Parse(id);
            }
        }

        protected Guid? GymId
        {
            get
            {
                string? id = User.FindFirst("gymId")?.Value;
                if (!string.IsNullOrEmpty(id))
                    return Guid.Parse(id);

                if (User.Identity != null && User.Identity.IsAuthenticated && User.IsInRole("User"))
                {
                    var userService = HttpContext.RequestServices.GetService(typeof(GymForge.Application.Modules.Users.Interface.IUserService)) as GymForge.Application.Modules.Users.Interface.IUserService;
                    if (userService != null)
                    {
                        var profile = userService.GetUserProfileAsync(UserId).GetAwaiter().GetResult();
                        return profile?.GymId;
                    }
                }

                return null;
            }
        }

        protected Guid? SecureBranchId
        {
            get
            {
                if (User.IsInRole("GymOwner"))
                {
                    string? queryValue = Request.Query["branchId"].ToString();
                    return string.IsNullOrEmpty(queryValue) ? null : Guid.Parse(queryValue);
                }
                
                string? branchClaim = User.FindFirst("branchId")?.Value;
                return string.IsNullOrEmpty(branchClaim) ? null : Guid.Parse(branchClaim);
            }
        }

        protected bool IsStandaloneUser => User.IsInRole("User");
    }
}
