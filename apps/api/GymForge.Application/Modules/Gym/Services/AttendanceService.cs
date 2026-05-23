using AutoMapper;
using GymForge.Application.Modules.Gym.Interfaces;
using GymForge.Contracts.Attendance;
using GymForge.Domain.Entities;
using GymForge.Domain.Interface;
using GymForge.Shared.Enums;
using GymForge.Shared.Models;

namespace GymForge.Application.Modules.Gym.Services
{
    public class AttendanceService : IAttendanceService
    {
        private readonly IAttendanceRepository _attendanceRepo;
        private readonly IGymMemberRepository _memberRepo;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;
        private const int SafetyLimit = 80;

        public AttendanceService(
            IAttendanceRepository attendanceRepo,
            IGymMemberRepository memberRepo,
            IMapper mapper,
            IUnitOfWork unitOfWork)
        {
            _attendanceRepo = attendanceRepo;
            _memberRepo = memberRepo;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
        }

        public async Task<AttendanceLogResponse> CheckInAsync(Guid gymId, Guid? branchId, CheckInRequest request, Guid verifiedByUserId)
        {
            GymMember? member = await _memberRepo.GetByIdAsync(request.MemberId);
            if (member == null)
                throw new KeyNotFoundException("Member not found.");

            if (member.Status == MemberStatus.Expired)
                throw new InvalidOperationException($"Access Denied: {member.FirstName}'s membership has expired.");

            if (member.Status == MemberStatus.Freeze)
                throw new InvalidOperationException($"Access Denied: {member.FirstName}'s membership is currently frozen.");

            if (member.Status != MemberStatus.Active)
                throw new InvalidOperationException($"Access Denied: {member.FirstName} is not an active member.");

            MemberSubscription? activeSub = member.Subscriptions
                .OrderByDescending(s => s.CreatedOn)
                .FirstOrDefault(s => s.IsActive);

            if (activeSub == null || activeSub.EndDate < DateTime.UtcNow)
                throw new InvalidOperationException($"Access Denied: {member.FirstName}'s subscription has expired.");

            AttendanceLog? existingLog = await _attendanceRepo.GetActiveCheckInAsync(request.MemberId, includeDetails: false);
            if (existingLog != null)
                throw new InvalidOperationException($"{member.FirstName} {member.LastName} is already checked in.");

            AttendanceLog log = new()
            {
                Id = Guid.NewGuid(),
                MemberId = request.MemberId,
                BranchId = branchId,
                CheckInTime = DateTime.UtcNow,
                VerifiedByUserId = verifiedByUserId,
                VerificationMethod = request.Method,
                CreatedBy = verifiedByUserId,
                CreatedOn = DateTime.UtcNow
            };

            await _attendanceRepo.AddAsync(log);
            await _unitOfWork.SaveChangesAsync();

            log.Member = member;

            return _mapper.Map<AttendanceLogResponse>(log);
        }

        public async Task<AttendanceLogResponse> CheckOutAsync(Guid gymId, Guid? branchId, CheckOutRequest request, Guid verifiedByUserId)
        {
            AttendanceLog? log = await _attendanceRepo.GetActiveCheckInAsync(request.MemberId);
            if (log == null)
                throw new InvalidOperationException("No active check-in found for this member.");

            log.CheckOutTime = DateTime.UtcNow;
            log.ModifiedBy = verifiedByUserId;
            log.ModifiedOn = DateTime.UtcNow;

            await _attendanceRepo.UpdateAsync(log);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<AttendanceLogResponse>(log);
        }

        public async Task<IEnumerable<CheckedInMemberResponse>> GetActiveOccupancyAsync(Guid gymId, Guid? branchId)
        {
            IEnumerable<AttendanceLog> logs = await _attendanceRepo.GetActiveOccupancyAsync(gymId, branchId);
            return _mapper.Map<IEnumerable<CheckedInMemberResponse>>(logs);
        }

        public async Task<OccupancyStatsResponse> GetOccupancyStatsAsync(Guid gymId, Guid? branchId)
        {
            int count = await _attendanceRepo.GetActiveOccupancyCountAsync(gymId, branchId);

            return new OccupancyStatsResponse
            {
                CurrentHeadcount = count,
                SafetyLimit = SafetyLimit,
                UtilizationPercentage = Math.Round(((double)count / SafetyLimit) * 100, 1)
            };
        }

        public async Task<PagedResponse<AttendanceLogResponse>> GetLogsAsync(Guid gymId, Guid? branchId, AttendanceLogQueryParams queryParams)
        {
            (IEnumerable<AttendanceLog> items, int totalCount) = await _attendanceRepo.GetLogsPagedAsync(
                gymId, branchId, queryParams.SearchTerm, queryParams.Status, queryParams.Date, queryParams.PageNumber, queryParams.PageSize);

            IEnumerable<AttendanceLogResponse> mapped = _mapper.Map<IEnumerable<AttendanceLogResponse>>(items);

            return new PagedResponse<AttendanceLogResponse>(mapped, totalCount, queryParams.PageNumber, queryParams.PageSize);
        }
    }
}
