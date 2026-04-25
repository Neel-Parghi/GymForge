namespace GymForge.Domain.Interface
{
    public interface ICurrentUserService
    {
        Guid? UserId { get; }
    }
}
