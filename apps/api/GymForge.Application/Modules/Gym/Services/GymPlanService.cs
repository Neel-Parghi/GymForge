using AutoMapper;
using GymForge.Application.Modules.Gym.Interfaces;
using GymForge.Contracts.GymPlans;
using GymForge.Domain.Entities;
using GymForge.Domain.Interface;

namespace GymForge.Application.Modules.Gym.Services
{
    public class GymPlanService : IGymPlanService
    {
        private readonly IGymPlanRepository _gymPlanRepository;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;

        public GymPlanService(IGymPlanRepository gymPlanRepository, IMapper mapper, IUnitOfWork unitOfWork) 
        {
            _gymPlanRepository = gymPlanRepository;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
        }

        public async Task<GymPlanDto> AddGymPlanAsync(CreateGymPlanRequest createGymPlan)
        {
            GymPlan gymPlan = _mapper.Map<GymPlan>(createGymPlan);
            GymPlan createdPlan = await _gymPlanRepository.AddGymPlanAsync(gymPlan);
            await _unitOfWork.SaveChangesAsync();
            return _mapper.Map<GymPlanDto>(createdPlan);
        }

        public async Task<GymPlanDto?> GetPlanByIdAsync(Guid planId)
        {
            GymPlan? gymPlan = await _gymPlanRepository.GetPlanByIdAsync(planId);
            if (gymPlan != null)
            {
                return _mapper.Map<GymPlanDto>(gymPlan);
            }
            return null;
        }

        public async Task<IEnumerable<GymPlanDto>> GetPlansByOwnerIdAsync(Guid ownerId)
        {
            IEnumerable<GymPlan> gymPlans = await _gymPlanRepository.GetPlansByOwnerIdAsync(ownerId);
            return _mapper.Map<IEnumerable<GymPlanDto>>(gymPlans);
        }

        public async Task<GymPlanDto> UpdateGymPlanAsync(UpdateGymPlanRequest updateGymPlan)
        {
            GymPlan? existingPlan = await _gymPlanRepository.GetPlanByIdAsync(updateGymPlan.Id);
            if (existingPlan == null)
            {
                throw new KeyNotFoundException("Gym Plan not found");
            }

            _mapper.Map(updateGymPlan, existingPlan);
            _gymPlanRepository.UpdateGymPlan(existingPlan);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<GymPlanDto>(existingPlan);
        }

        public async Task<bool> DeleteGymPlanAsync(Guid planId)
        {
            bool deleted = await _gymPlanRepository.DeleteGymPlanAsync(planId);
            if (deleted)
            {
                await _unitOfWork.SaveChangesAsync();
            }
            return deleted;
        }
    }
}
