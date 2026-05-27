using AutoMapper;
using GymForge.Application.Modules.Auth.Interface;
using GymForge.Application.Modules.Gym.Interfaces;
using GymForge.Contracts.Common;
using GymForge.Contracts.Staff;
using GymForge.Domain.Entities;
using GymForge.Domain.Interface;
using GymForge.Shared.Enums;
using GymForge.Shared.Models;

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

        public async Task<PagedResponse<StaffResponse>> GetGymStaffAsync(Guid gymId, PaginationParams pagination, Guid? branchId = null)
        {
            (IEnumerable<Staff> staff, int totalCount) = await _staffRepository.GetPagedStaffAsync(
                gymId,
                pagination.PageNumber,
                pagination.PageSize,
                pagination.SearchTerm,
                branchId);

            IEnumerable<StaffResponse> items = _mapper.Map<IEnumerable<StaffResponse>>(staff);

            return new PagedResponse<StaffResponse>(
                items,
                totalCount,
                pagination.PageNumber,
                pagination.PageSize);
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

        public async Task AssignTrainerToMemberAsync(Guid trainerId, Guid memberId, string? slot = null, int? durationDays = null)
        {
            PTAssignment? existing = await _staffRepository.GetActiveAssignmentAsync(trainerId, memberId);
            if (existing != null)
            {
                existing.IsActive = false;
                existing.EndDate = DateTime.UtcNow;
            }

            PTAssignment assignment = new()
            {
                TrainerId = trainerId,
                MemberId = memberId,
                StartDate = DateTime.UtcNow,
                EndDate = durationDays.HasValue ? DateTime.UtcNow.AddDays(durationDays.Value) : null,
                PreferredSlot = slot,
                IsActive = true
            };

            await _staffRepository.AddPTAssignmentAsync(assignment);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<IEnumerable<TrainerMemberResponse>> GetAssignedMembersAsync(Guid trainerId)
        {
            IEnumerable<PTAssignment> assignments = await _staffRepository.GetAssignmentsByTrainerIdAsync(trainerId);
            return assignments.Select(a => {
                string status = "Active";
                if (!a.IsActive)
                {
                    status = "Terminated";
                }
                else if (a.EndDate != null && a.EndDate <= DateTime.UtcNow)
                {
                    status = "Expired";
                }

                return new TrainerMemberResponse
                {
                    AssignmentId = a.Id,
                    MemberId = a.MemberId,
                    FirstName = a.Member.FirstName,
                    LastName = a.Member.LastName,
                    Email = a.Member.Email,
                    PhoneNumber = a.Member.PhoneNumber,
                    MembershipNumber = a.Member.MembershipNumber,
                    AssignedSlot = a.PreferredSlot,
                    AssignedDate = a.StartDate,
                    EndDate = a.EndDate,
                    IsActive = a.IsActive && (a.EndDate == null || a.EndDate > DateTime.UtcNow),
                    Status = status
                };
            }).ToList();
        }

        public async Task DeallocateMemberFromTrainerAsync(Guid trainerId, Guid memberId)
        {
            PTAssignment? assignment = await _staffRepository.GetActiveAssignmentAsync(trainerId, memberId);
            if (assignment != null)
            {
                assignment.IsActive = false;
                assignment.EndDate = DateTime.UtcNow;
                await _unitOfWork.SaveChangesAsync();
            }
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

        public async Task<StaffResponse> CheckInStaffAsync(Guid staffId, Guid gymId, Guid? branchId, string? notes)
        {
            Staff? staff = await _staffRepository.GetByIdAsync(staffId);
            if (staff == null)
            {
                throw new KeyNotFoundException("Staff member not found.");
            }

            if (staff.IsCheckedIn)
            {
                throw new InvalidOperationException("Staff member is already checked in.");
            }

            staff.IsCheckedIn = true;
            staff.LastCheckInTime = DateTime.UtcNow;

            StaffAttendanceLog log = new()
            {
                StaffId = staffId,
                GymId = gymId,
                BranchId = branchId,
                CheckInTime = DateTime.UtcNow,
                Notes = notes
            };

            await _staffRepository.AddStaffAttendanceLogAsync(log);
            await _staffRepository.UpdateAsync(staff);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<StaffResponse>(staff);
        }

        public async Task<StaffResponse> CheckOutStaffAsync(Guid staffId, Guid gymId, Guid? branchId)
        {
            Staff? staff = await _staffRepository.GetByIdAsync(staffId);
            if (staff == null)
            {
                throw new KeyNotFoundException("Staff member not found.");
            }

            if (!staff.IsCheckedIn)
            {
                throw new InvalidOperationException("Staff member is not checked in.");
            }

            staff.IsCheckedIn = false;

            StaffAttendanceLog? log = await _staffRepository.GetActiveStaffAttendanceLogAsync(staffId);
            if (log != null)
            {
                log.CheckOutTime = DateTime.UtcNow;
            }

            await _staffRepository.UpdateAsync(staff);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<StaffResponse>(staff);
        }

        public async Task<IEnumerable<StaffAttendanceLogResponse>> GetStaffAttendanceLogsAsync(Guid gymId, Guid? branchId = null)
        {
            IEnumerable<StaffAttendanceLog> logs = await _staffRepository.GetStaffAttendanceLogsAsync(gymId, branchId);
            return logs.Select(log => {
                double? hours = log.CheckOutTime.HasValue 
                    ? (log.CheckOutTime.Value - log.CheckInTime).TotalHours 
                    : (double?)null;
                
                string roleStr = log.Staff != null ? log.Staff.Role.ToString() : string.Empty;
                
                return new StaffAttendanceLogResponse
                {
                    Id = log.Id,
                    StaffId = log.StaffId,
                    StaffName = log.Staff != null ? $"{log.Staff.FirstName} {log.Staff.LastName}" : "Unknown Staff",
                    StaffNumber = log.Staff?.StaffNumber ?? string.Empty,
                    RoleName = roleStr,
                    CheckInTime = log.CheckInTime,
                    CheckOutTime = log.CheckOutTime,
                    Notes = log.Notes,
                    HoursWorked = hours.HasValue ? Math.Round(hours.Value, 2) : (double?)null
                };
            }).ToList();
        }

        public async Task<PagedResponse<StaffAttendanceLogResponse>> GetStaffAttendanceLogsPagedAsync(
            Guid gymId,
            PaginationParams pagination,
            Guid? branchId = null)
        {
            PagedResponse<StaffAttendanceLog> pagedLogs = await _staffRepository.GetStaffAttendanceLogsPagedAsync(gymId, pagination, branchId);
            
            IEnumerable<StaffAttendanceLogResponse> itemsResponse = pagedLogs.Items.Select(log => {
                double? hours = log.CheckOutTime.HasValue 
                    ? (log.CheckOutTime.Value - log.CheckInTime).TotalHours 
                    : (double?)null;
                
                string roleStr = log.Staff != null ? log.Staff.Role.ToString() : string.Empty;
                
                return new StaffAttendanceLogResponse
                {
                    Id = log.Id,
                    StaffId = log.StaffId,
                    StaffName = log.Staff != null ? $"{log.Staff.FirstName} {log.Staff.LastName}" : "Unknown Staff",
                    StaffNumber = log.Staff?.StaffNumber ?? string.Empty,
                    RoleName = roleStr,
                    CheckInTime = log.CheckInTime,
                    CheckOutTime = log.CheckOutTime,
                    Notes = log.Notes,
                    HoursWorked = hours.HasValue ? Math.Round(hours.Value, 2) : (double?)null
                };
            }).ToList();

            return new PagedResponse<StaffAttendanceLogResponse>(
                itemsResponse,
                pagedLogs.TotalCount,
                pagedLogs.PageNumber,
                pagedLogs.PageSize);
        }
    }
}
