using AutoMapper;
using GymForge.Application.Modules.Auth.Interface;
using GymForge.Application.Modules.Gym.Interfaces;
using GymForge.Contracts.Staff;
using GymForge.Domain.Entities;
using GymForge.Domain.Interface;
using GymForge.Shared.Enums;

namespace GymForge.Application.Modules.Gym.Services
{
    public class StaffService : IStaffService
    {
        private readonly IStaffRepository _staffRepository;
        private readonly IAuthRepository _authRepository;
        private readonly IPasswordService _passwordService;
        private readonly IEmailService _emailService;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;

        public StaffService(
            IStaffRepository staffRepository, 
            IAuthRepository authRepository,
            IPasswordService passwordService,
            IEmailService emailService,
            IMapper mapper, 
            IUnitOfWork unitOfWork)
        {
            _staffRepository = staffRepository;
            _authRepository = authRepository;
            _passwordService = passwordService;
            _emailService = emailService;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
        }

        public async Task<StaffResponse> AddStaffAsync(Guid gymId, AddStaffRequest request)
        {
            if (await _staffRepository.ExistsByEmailAsync(request.Email, gymId))
            {
                throw new InvalidOperationException("Staff with this email already exists in this gym.");
            }

            // Check if User already exists
            User? user = await _authRepository.GetByUserByEmailAsync(request.Email);
            if (user == null)
            {
                string token = Guid.NewGuid().ToString();

                // Create a basic User account for the staff with invitation logic
                user = new User
                {
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    Email = request.Email,
                    Phone = request.PhoneNumber,
                    Role = MapToUserRole(request.Role),
                    InvitationToken = token,
                    InvitationExpiry = DateTime.UtcNow.AddDays(7),
                    IsInvitationAccepted = false,
                    IsActive = true,
                    GymId = gymId,
                    CreatedOn = DateTime.UtcNow
                };
                await _authRepository.AddUserAsync(user);

                await _emailService.SendInvitationEmailAsync(user.Email, $"{user.FirstName} {user.LastName}", token);
            }

            Staff staff = _mapper.Map<Staff>(request);
            staff.GymId = gymId;
            staff.UserId = user.Id;
            staff.StaffNumber = $"STF-{DateTime.UtcNow.Ticks.ToString().Substring(10)}";
            staff.JoiningDate = DateTime.UtcNow;
            staff.IsActive = true;

            await _staffRepository.AddAsync(staff);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<StaffResponse>(staff);
        }

        private UserRole MapToUserRole(StaffRole staffRole)
        {
            return staffRole switch
            {
                StaffRole.Trainer => UserRole.Trainer,
                StaffRole.YogaInstructor => UserRole.Trainer,
                StaffRole.ZumbaInstructor => UserRole.Trainer,
                _ => UserRole.Staff
            };
        }

        public async Task<IEnumerable<StaffResponse>> GetGymStaffAsync(Guid gymId)
        {
            IEnumerable<Staff> staff = await _staffRepository.GetAllByGymIdAsync(gymId);
            return _mapper.Map<IEnumerable<StaffResponse>>(staff);
        }

        public async Task<StaffResponse?> GetStaffByIdAsync(Guid id)
        {
            Staff? staff = await _staffRepository.GetByIdAsync(id);
            return staff != null ? _mapper.Map<StaffResponse>(staff) : null;
        }

        public async Task UpdateStaffAsync(Guid id, AddStaffRequest request)
        {
            Staff? staff = await _staffRepository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Staff not found.");

            _mapper.Map(request, staff);
            await _staffRepository.UpdateAsync(staff);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task DeleteStaffAsync(Guid id)
        {
            await _staffRepository.DeleteAsync(id);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task AssignTrainerToMemberAsync(Guid trainerId, Guid memberId, string? slot = null)
        {
            PTAssignment assignment = new()
            {
                TrainerId = trainerId,
                MemberId = memberId,
                StartDate = DateTime.UtcNow,
                PreferredSlot = slot,
                IsActive = true
            };

            await _staffRepository.AddPTAssignmentAsync(assignment);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<IEnumerable<TrainerMemberResponse>> GetAssignedMembersAsync(Guid trainerId)
        {
            IEnumerable<PTAssignment> assignments = await _staffRepository.GetAssignmentsByTrainerIdAsync(trainerId);
            return assignments.Select(a => new TrainerMemberResponse
            {
                MemberId = a.MemberId,
                FirstName = a.Member.FirstName,
                LastName = a.Member.LastName,
                Email = a.Member.Email,
                PhoneNumber = a.Member.PhoneNumber,
                MembershipNumber = a.Member.MembershipNumber,
                AssignedSlot = a.PreferredSlot,
                AssignedDate = a.StartDate
            });
        }

        public async Task RecordMeasurementAsync(Guid memberId, Guid recordedById, AddMeasurementRequest request)
        {
            MemberMeasurement measurement = new()
            {
                MemberId = memberId,
                RecordedById = recordedById == Guid.Empty ? null : recordedById,
                Weight = request.Weight,
                Height = request.Height,
                BodyFatPercentage = request.BodyFatPercentage,
                BMI = request.BMI,
                Notes = request.Notes,
                Date = DateTime.UtcNow
            };

            await _staffRepository.AddMeasurementAsync(measurement);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<IEnumerable<MeasurementResponse>> GetMemberMeasurementsAsync(Guid memberId)
        {
            IEnumerable<MemberMeasurement> measurements = await _staffRepository.GetMeasurementsByMemberIdAsync(memberId);
            return _mapper.Map<IEnumerable<MeasurementResponse>>(measurements);
        }
    }
}
