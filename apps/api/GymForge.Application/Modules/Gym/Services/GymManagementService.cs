using AutoMapper;
using GymForge.Application.Modules.Gym.Interfaces;
using GymForge.Contracts.Gym;
using GymForge.Domain.Entities;
using GymForge.Domain.Interface;

namespace GymForge.Application.Modules.Gym.Services
{
    public class GymManagementService : IGymManagementService
    {
        private readonly IGymManagementRepository _repository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public GymManagementService(IGymManagementRepository repository, IUnitOfWork unitOfWork, IMapper mapper)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task OnboardGymAsync(Guid ownerId, GymOnboardingDto gymOnboardingDto)
        {
            // 1. Setup and Add Address
            Address address = _mapper.Map<Address>(gymOnboardingDto.Address);
            address.Id = Guid.NewGuid();
            await _repository.AddAddressAsync(address);

            // 2. Setup and Add Gym
            Domain.Entities.Gym gym = _mapper.Map<Domain.Entities.Gym>(gymOnboardingDto);
            gym.Id = Guid.NewGuid();
            gym.AddressId = address.Id;
            gym.OwnerUserId = ownerId;
            gym.IsActive = true;
            gym.IsVerified = false;
            await _repository.AddGymAsync(gym);

            // 3. Setup and Add Branches
            bool isFirstBranch = true;
            foreach(var branchDto in gymOnboardingDto.Branches)
            {
                Address branchAddress = _mapper.Map<Address>(branchDto.Address);
                branchAddress.Id = Guid.NewGuid();
                await _repository.AddAddressAsync(branchAddress);

                Branch branch = _mapper.Map<Branch>(branchDto);
                branch.Id = Guid.NewGuid();
                branch.GymId = gym.Id;
                branch.AddressId = branchAddress.Id;
                branch.IsMainBranch = isFirstBranch;
                branch.IsActive = true;
                
                await _repository.AddBranchAsync(branch);
                isFirstBranch = false;
            }

            // 4. Setup and Add Gym Subscription Plan
            GymSubscription subscription = new() 
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
            await _repository.AddGymSubscriptionAsync(subscription);

            // 5. Commit Transaction
            await _unitOfWork.SaveChangesAsync();
        }
    }
}
