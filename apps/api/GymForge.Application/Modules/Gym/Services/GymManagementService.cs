using AutoMapper;
using GymForge.Application.Modules.Gym.Interfaces;
using GymForge.Contracts.Gym.Management;
using GymForge.Contracts.Gym.Owners;
using GymForge.Contracts.Gym.Onboarding;
using GymForge.Contracts.Gym.Shared;
using GymForge.Domain.Entities;
using GymForge.Domain.Interface;

namespace GymForge.Application.Modules.Gym.Services
{
    public class GymManagementService : IGymManagementService
    {
        private readonly IGymManagementRepository _gymManagementRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public GymManagementService(IGymManagementRepository repository, IUnitOfWork unitOfWork, IMapper mapper)
        {
            _gymManagementRepository = repository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task OnboardGymAsync(Guid ownerId, GymOnboardingDto gymOnboardingDto)
        {
            // 1. Setup and Add Address
            Address address = _mapper.Map<Address>(gymOnboardingDto.Address);
            address.Id = Guid.NewGuid();
            await _gymManagementRepository.AddAddressAsync(address);

            // 2. Setup and Add Gym
            Domain.Entities.Gym gym = _mapper.Map<Domain.Entities.Gym>(gymOnboardingDto);
            gym.Id = Guid.NewGuid();
            gym.AddressId = address.Id;
            gym.OwnerUserId = ownerId;
            gym.IsActive = true;
            gym.IsVerified = false;
            await _gymManagementRepository.AddGymAsync(gym);

            // 3. Setup and Add Branches
            bool isFirstBranch = true;
            foreach(BranchDto branchDto in gymOnboardingDto.Branches)
            {
                Address branchAddress = _mapper.Map<Address>(branchDto.Address);
                branchAddress.Id = Guid.NewGuid();
                await _gymManagementRepository.AddAddressAsync(branchAddress);

                Branch branch = _mapper.Map<Branch>(branchDto);
                branch.Id = Guid.NewGuid();
                branch.GymId = gym.Id;
                branch.AddressId = branchAddress.Id;
                branch.IsMainBranch = isFirstBranch;
                branch.IsActive = true;
                
                await _gymManagementRepository.AddBranchAsync(branch);
                isFirstBranch = false;
            }

            // 4. Setup and Add Gym Subscription Plan
            SubscriptionRecord subscription = new() 
            {
                Id = Guid.NewGuid(),
                GymId = gym.Id,
                PlanId = gymOnboardingDto.PlanId,
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddDays(gymOnboardingDto.IsTrial ? 14 : 30),
                IsTrial = gymOnboardingDto.IsTrial,
                IsActive = true,
                PriceAtPurchase = 0m,
                Notes = "Initial Onboarding Subscription"
            };
            await _gymManagementRepository.AddGymSubscriptionAsync(subscription);

            // 5. Commit Transaction
            await _unitOfWork.SaveChangesAsync();
        }
    
        public async Task<List<GymOwnersDto>> GetGymOwnersList()
        {
            return await _gymManagementRepository.GetGymOwnersList();
        }

        public async Task<List<GymListResponseDto>> GetGymListAsync()
        {
            return await _gymManagementRepository.GetGymListAsync();
        }

        public async Task<GymOwnersDto> UpdateGymOwner(UpdateGymOwnerDto updateGymOwnerDto)
        {
            User? user = await _gymManagementRepository.GetGymOwnerByIdAsync(updateGymOwnerDto.Id);
            if (user == null)
            {
                throw new Exception("Gym Owner not found.");
            }

            _mapper.Map(updateGymOwnerDto, user);

            User updatedOwner = _gymManagementRepository.UpdateGymOwner(user);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<GymOwnersDto>(updatedOwner);
        }

        public async Task UpdateGymAsync(UpdateGymDto updateGymDto)
        {
            Domain.Entities.Gym? gym = await _gymManagementRepository.GetGymByIdAsync(updateGymDto.Id);
            if (gym == null)
            {
                throw new Exception("Gym not found.");
            }

            _mapper.Map(updateGymDto, gym);
            _gymManagementRepository.UpdateGym(gym);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task DeleteGymAsync(Guid gymId)
        {
            await _gymManagementRepository.DeleteGymAsync(gymId);
            await _unitOfWork.SaveChangesAsync();
        }
        
        public async Task AddBranchAsync(Guid gymId, BranchDto branchDto)
        {
            Address branchAddress = _mapper.Map<Address>(branchDto.Address);
            branchAddress.Id = Guid.NewGuid();
            await _gymManagementRepository.AddAddressAsync(branchAddress);

            Branch branch = _mapper.Map<Branch>(branchDto);
            branch.Id = Guid.NewGuid();
            branch.GymId = gymId;
            branch.AddressId = branchAddress.Id;
            branch.IsMainBranch = false;
            branch.IsActive = true;
            
            await _gymManagementRepository.AddBranchAsync(branch);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<List<BranchDto>> GetBranchesByGymIdAsync(Guid gymId)
        {
            List<Branch> branches = await _gymManagementRepository.GetBranchesByGymIdAsync(gymId);
            return _mapper.Map<List<BranchDto>>(branches);
        }
    }
}
