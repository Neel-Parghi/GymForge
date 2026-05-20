using GymForge.Domain.Entities;

namespace GymForge.Domain.Interface
{
    public interface IEquipmentRepository
    {
        Task<Equipment?> GetEquipmentByIdAsync(Guid id);
        Task<List<Equipment>> GetEquipmentByGymIdAsync(Guid gymId, Guid? branchId = null);
        Task AddEquipmentAsync(Equipment equipment);
        Equipment UpdateEquipment(Equipment equipment);
        Task DeleteEquipmentAsync(Guid id);
    }
}
