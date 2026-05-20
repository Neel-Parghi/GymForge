using AutoMapper;
using GymForge.Application.DTOs.Inventory;
using GymForge.Application.Modules.Gym.Interfaces;
using GymForge.Domain.Entities;
using GymForge.Domain.Interface;

namespace GymForge.Application.Modules.Gym.Services
{
    public class EquipmentService : IEquipmentService
    {
        private readonly IEquipmentRepository _equipmentRepository;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;

        public EquipmentService(IEquipmentRepository equipmentRepository, IMapper mapper, IUnitOfWork unitOfWork)
        {
            _equipmentRepository = equipmentRepository;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
        }

        public async Task<List<EquipmentDto>> GetEquipmentAsync(Guid gymId, Guid? branchId = null)
        {
            List<Equipment> equipment = await _equipmentRepository.GetEquipmentByGymIdAsync(gymId, branchId);
            return _mapper.Map<List<EquipmentDto>>(equipment);
        }

        public async Task<EquipmentDto> AddEquipmentAsync(CreateEquipmentDto dto, Guid gymId)
        {
            Equipment equipment = _mapper.Map<Equipment>(dto);
            equipment.GymId = gymId;
            equipment.CreatedOn = DateTime.UtcNow;

            await _equipmentRepository.AddEquipmentAsync(equipment);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<EquipmentDto>(equipment);
        }

        public async Task<bool> UpdateEquipmentAsync(Guid id, CreateEquipmentDto dto)
        {
            Equipment? equipment = await _equipmentRepository.GetEquipmentByIdAsync(id);
            if (equipment == null) return false;

            _mapper.Map(dto, equipment);
            equipment.ModifiedOn = DateTime.UtcNow;

            _equipmentRepository.UpdateEquipment(equipment);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
    }
}
