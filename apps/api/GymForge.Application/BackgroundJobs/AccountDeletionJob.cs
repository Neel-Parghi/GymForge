using GymForge.Domain.Entities;
using GymForge.Domain.Interface;
using Microsoft.Extensions.Logging;

namespace GymForge.Application.BackgroundJobs
{
    public class AccountDeletionJob
    {
        private readonly IAuthRepository _authRepository;
        private readonly IGymMemberRepository _gymMemberRepository;
        private readonly IStaffRepository _staffRepository;
        private readonly IAddressRepository _addressRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<AccountDeletionJob> _logger;

        public AccountDeletionJob(
            IAuthRepository authRepository,
            IGymMemberRepository gymMemberRepository,
            IStaffRepository staffRepository,
            IAddressRepository addressRepository,
            IUnitOfWork unitOfWork,
            ILogger<AccountDeletionJob> logger)
        {
            _authRepository = authRepository;
            _gymMemberRepository = gymMemberRepository;
            _staffRepository = staffRepository;
            _addressRepository = addressRepository;
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task ExecuteAsync(Guid userId)
        {
            _logger.LogInformation($"AccountDeletionJob started for user {userId}");

            // 1. Find User
            User? user = await _authRepository.GetUserByIdAsync(userId);
            
            if (user == null)
            {
                _logger.LogWarning($"User {userId} not found for deletion.");
                return;
            }

            // Prevent Gym Owners from hard deleting their account via this job.
            // If they are a gym owner, they must delete the gym or transfer ownership.
            if (user.Role == Shared.Enums.UserRole.GymOwner)
            {
                _logger.LogWarning($"User {userId} is a Gym Owner. Deletion aborted to prevent cascading gym data loss.");
                return;
            }

            // 2. Unlink GymMember profile if exists
            GymMember? member = await _gymMemberRepository.GetByUserIdAsync(userId);
            
            if (member != null)
            {
                member.UserId = null;
                await _gymMemberRepository.UpdateAsync(member);
                _logger.LogInformation($"Unlinked GymMember {member.Id} from User {userId}");
            }

            // 3. Unlink Staff profile if exists
            Staff? staff = await _staffRepository.GetByUserIdAsync(userId);
            
            if (staff != null)
            {
                staff.UserId = null;
                await _staffRepository.UpdateAsync(staff);
                _logger.LogInformation($"Unlinked Staff {staff.Id} from User {userId}");
            }

            // 4. Delete user address
            if (user.AddressId.HasValue)
            {
                await _addressRepository.DeleteAsync(user.AddressId.Value);
                _logger.LogInformation($"Deleted Address {user.AddressId.Value} for User {userId}");
            }

            // 5. Delete Core User Record
            await _authRepository.DeleteUserAsync(user);
            _logger.LogInformation($"Deleted core User record {userId}");

            // 6. Commit all changes
            await _unitOfWork.SaveChangesAsync();
            _logger.LogInformation($"AccountDeletionJob completed for user {userId}");
        }
    }
}
