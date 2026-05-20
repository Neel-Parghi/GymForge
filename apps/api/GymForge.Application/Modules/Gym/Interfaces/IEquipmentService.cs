using GymForge.Application.DTOs.Inventory;

namespace GymForge.Application.Modules.Gym.Interfaces
{
    public interface IEquipmentService
    {
        Task<List<EquipmentDto>> GetEquipmentAsync(Guid gymId, Guid? branchId = null);
        Task<EquipmentDto> AddEquipmentAsync(CreateEquipmentDto dto, Guid gymId);
        Task<bool> UpdateEquipmentAsync(Guid id, CreateEquipmentDto dto);
    }
}
