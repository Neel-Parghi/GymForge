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
    }
}
