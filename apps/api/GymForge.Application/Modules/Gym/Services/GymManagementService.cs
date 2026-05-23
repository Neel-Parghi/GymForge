using AutoMapper;
using GymForge.Application.Modules.Gym.Interfaces;
using GymForge.Contracts.Common;
using GymForge.Contracts.Gym.Management;
using GymForge.Contracts.Gym.Onboarding;
using GymForge.Contracts.Gym.Owners;
using GymForge.Contracts.Gym.Shared;
using GymForge.Domain.Entities;
using GymForge.Domain.Interface;
using GymForge.Shared.Models;

namespace GymForge.Application.Modules.Gym.Services
{
    public class GymManagementService : IGymManagementService
    {
        private readonly IGymManagementRepository _gymManagementRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IAddressRepository _addressRepository;

        public GymManagementService(IGymManagementRepository repository, IUnitOfWork unitOfWork, IMapper mapper, IAddressRepository addressRepository)
        {
            _gymManagementRepository = repository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _addressRepository = addressRepository;
        }

        public async Task OnboardGymAsync(Guid ownerId, GymOnboardingDto gymOnboardingDto)
        {
            // 1 Setup and Add Address
            Address address = _mapper.Map<Address>(gymOnboardingDto.Address);
            address.Id = Guid.NewGuid();
            await _addressRepository.AddAsync(address);

            // 2 Setup and Add Gym
            Domain.Entities.Gym gym = _mapper.Map<Domain.Entities.Gym>(gymOnboardingDto);
            gym.Id = Guid.NewGuid();
            gym.AddressId = address.Id;
            gym.OwnerUserId = ownerId;
            gym.IsActive = true;
            gym.IsVerified = false;
            await _gymManagementRepository.AddGymAsync(gym);

            // 3 Link User to Gym
            User? user = await _gymManagementRepository.GetGymOwnerByIdAsync(ownerId);
            if (user != null)
            {
                user.GymId = gym.Id;
                _gymManagementRepository.UpdateGymOwner(user);
            }

            // 4 Setup and Add Branches
            bool isFirstBranch = true;
            foreach(BranchDto branchDto in gymOnboardingDto.Branches)
            {
                Address branchAddress = _mapper.Map<Address>(branchDto.Address);
                branchAddress.Id = Guid.NewGuid();
                await _addressRepository.AddAsync(branchAddress);

                Branch branch = _mapper.Map<Branch>(branchDto);
                branch.Id = Guid.NewGuid();
                branch.GymId = gym.Id;
                branch.AddressId = branchAddress.Id;
                branch.IsMainBranch = isFirstBranch;
                branch.IsActive = true;
                
                await _gymManagementRepository.AddBranchAsync(branch);
                isFirstBranch = false;
            }

            // 5 Setup and Add Gym Subscription Plan
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

            // 6 Commit Transaction
            await _unitOfWork.SaveChangesAsync();
        }
    
        public async Task<PagedResponse<GymOwnersDto>> GetGymOwnersList(PaginationParams pagination)
        {
            (List<GymOwnersDto>items, int totalCount) = await _gymManagementRepository.GetGymOwnersList(
                pagination.PageNumber,
                pagination.PageSize,
                pagination.SearchTerm);

            return new PagedResponse<GymOwnersDto>(items, totalCount, pagination.PageNumber, pagination.PageSize);
        }

        public async Task<PagedResponse<GymListResponseDto>> GetGymListAsync(PaginationParams pagination)
        {
            (List<GymListResponseDto> items, int totalCount) = await _gymManagementRepository.GetGymListAsync(
                pagination.PageNumber,
                pagination.PageSize,
                pagination.SearchTerm);

            return new PagedResponse<GymListResponseDto>(items, totalCount, pagination.PageNumber, pagination.PageSize);
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

        public async Task<bool> DeleteGymAsync(Guid gymId)
        {
            List<Branch>? branches = await _gymManagementRepository.GetBranchesByGymIdAsync(gymId);
            if (branches != null && branches.Any())
            {
                return false;
            }

            await _gymManagementRepository.DeleteGymAsync(gymId);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteGymOwnerAsync(Guid ownerId)
        {
            User? owner = await _gymManagementRepository.GetGymOwnerByIdAsync(ownerId);
            if (owner == null) return false;

            owner.IsActive = false;
            _gymManagementRepository.UpdateGymOwner(owner);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
        
        public async Task AddBranchAsync(Guid gymId, BranchDto branchDto)
        {
            Address branchAddress = _mapper.Map<Address>(branchDto.Address);
            branchAddress.Id = Guid.NewGuid();
            await _addressRepository.AddAsync(branchAddress);

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
            List<BranchDto> dtos = _mapper.Map<List<BranchDto>>(branches);

            List<Staff> managers = await _gymManagementRepository.GetBranchManagersAsync(gymId);

            foreach (BranchDto dto in dtos)
            {
                Staff? manager = managers.FirstOrDefault(m => m.BranchId == dto.Id);
                dto.ManagerName = manager != null ? $"{manager.FirstName} {manager.LastName}" : "Pending Hire";
            }

            return dtos;
        }

        public async Task UpdateBranchAsync(Guid branchId, BranchDto branchDto)
        {
            Branch? branch = await _gymManagementRepository.GetBranchByIdAsync(branchId);
            if (branch == null)
            {
                throw new Exception("Branch not found.");
            }

            branch.Name = branchDto.Name;
            branch.ContactNumber = branchDto.ContactNumber;
            branch.OpenTime = branchDto.OpenTime;
            branch.CloseTime = branchDto.CloseTime;

            if (branch.Address != null && branchDto.Address != null)
            {
                _mapper.Map(branchDto.Address, branch.Address);
            }

            _gymManagementRepository.UpdateBranch(branch);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<GymListResponseDto?> GetGymByOwnerIdAsync(Guid ownerId)
        {
            return await _gymManagementRepository.GetGymByOwnerIdAsync(ownerId);
        }

        public async Task UpdateMyGymAsync(Guid ownerId, UpdateMyGymDto updateMyGymDto)
        {
            Domain.Entities.Gym? gym = await _gymManagementRepository.GetGymByIdAsync((await _gymManagementRepository.GetGymByOwnerIdAsync(ownerId))?.Id ?? Guid.Empty);
            if (gym == null)
            {
                throw new Exception("Gym not found for this owner.");
            }

            _mapper.Map(updateMyGymDto, gym);
            _gymManagementRepository.UpdateGym(gym);
            await _unitOfWork.SaveChangesAsync();
        }
    }
}
