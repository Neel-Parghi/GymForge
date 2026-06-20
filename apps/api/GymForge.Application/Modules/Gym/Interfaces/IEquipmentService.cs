using GymForge.Contracts.Gym.Inventory;
using GymForge.Contracts.Common;
using GymForge.Shared.Models;

namespace GymForge.Application.Modules.Gym.Interfaces
{
    public interface IEquipmentService
    {
        Task<PagedResponse<EquipmentDto>> GetEquipmentAsync(Guid gymId, PaginationParams pagination, Guid? branchId = null);
        Task<EquipmentDto> AddEquipmentAsync(CreateEquipmentDto dto, Guid gymId);
        Task<bool> UpdateEquipmentAsync(Guid id, CreateEquipmentDto dto);
    }
}
