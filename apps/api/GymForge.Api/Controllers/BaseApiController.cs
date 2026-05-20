using Microsoft.AspNetCore.Mvc;

namespace GymForge.Api.Controllers
{
    [ApiController]
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
                return string.IsNullOrEmpty(id) ? null : Guid.Parse(id);
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
    }
}
