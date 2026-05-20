using System;

namespace GymForge.Domain.Interface
{
    public interface IBranchScoped
    {
        Guid? BranchId { get; set; }
    }
}
