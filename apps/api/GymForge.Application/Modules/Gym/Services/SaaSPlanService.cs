using AutoMapper;
using GymForge.Application.Modules.Gym.Interfaces;
using GymForge.Contracts.SaaSPlan;
using GymForge.Domain.Entities;
using GymForge.Domain.Interface;

namespace GymForge.Application.Modules.Gym.Services
{
    internal class SaaSPlanService : ISaaSPlanService
    {
        private readonly ISaaSPlanRepository _saasPlanRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;


        public SaaSPlanService(ISaaSPlanRepository saasPlanRepository, IUnitOfWork unitOfWork, IMapper mapper)
        {
            _saasPlanRepository = saasPlanRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }
        public async Task<SaaSPlanDto> AddPlanAsync(CreateSaaSPlanDto createPlanDto)
        {
            Plan createPlan = _mapper.Map<Plan>(createPlanDto);
            Plan createdPlan = await _saasPlanRepository.AddPlanAsync(createPlan);
            await _unitOfWork.SaveChangesAsync();
            return _mapper.Map<SaaSPlanDto>(createdPlan); 
        }

        public Task<bool> DeletePlanAsync(Guid id)
        {
            return _saasPlanRepository.DeletePlanAsync(id);
        }

        public async Task<List<SaaSPlanDto>> GetAllPlansAsync()
        {
            List<Plan> plansList = await _saasPlanRepository.GetAllPlansAsync();
            return _mapper.Map<List<SaaSPlanDto>>(plansList);
        }

        public async Task<SaaSPlanDto?> GetPlanByIdAsync(Guid id)
        {
            Plan? plan = await _saasPlanRepository.GetPlanByIdAsync(id);
            if (plan != null)
            {   
                return _mapper.Map<SaaSPlanDto>(plan);
            }
            return null;
        }

        public async Task<SaaSPlanDto> UpdatePlanAsync(UpdateSaaSPlanDto updateSaaSPlanDto)
        {
            Plan? existingPlan = await _saasPlanRepository.GetPlanByIdAsync(updateSaaSPlanDto.Id);
            if (existingPlan == null)
            {
                throw new Exception("Plan not found.");
            }

            // Maps onto the existing entity, preserving Id and unmapped fields
            _mapper.Map(updateSaaSPlanDto, existingPlan);

            Plan updatedPlan = _saasPlanRepository.UpdatePlanAsync(existingPlan);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<SaaSPlanDto>(updatedPlan);
        }
    }
}
