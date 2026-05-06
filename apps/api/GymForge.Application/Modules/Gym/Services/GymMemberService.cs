using AutoMapper;
using GymForge.Application.Modules.Gym.Interfaces;
using GymForge.Contracts.Members;
using GymForge.Domain.Entities;
using GymForge.Domain.Interface;
using GymForge.Shared.Enums;

namespace GymForge.Application.Modules.Gym.Services
{
    public class GymMemberService : IGymMemberService
    {
        private readonly IGymMemberRepository _memberRepository;
        private readonly IGymPlanRepository _planRepository;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;

        public GymMemberService(IGymMemberRepository memberRepository, IGymPlanRepository planRepository, IMapper mapper, IUnitOfWork unitOfWork)
        {
            _memberRepository = memberRepository;
            _planRepository = planRepository;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
        }

        public async Task<GymMemberResponse> OnboardMemberAsync(Guid gymId, OnboardMemberRequest request, Guid createdBy)
        {
            if (await _memberRepository.ExistsByEmailAsync(request.Email, gymId))
            {
                throw new InvalidOperationException("A member with this email already exists in your gym.");
            }

            GymPlan? planTemplate = await _planRepository.GetPlanByIdAsync(request.GymPlanId);
            if (planTemplate == null)
            {
                throw new KeyNotFoundException("The selected membership plan was not found.");
            }

            GymMember member = new()
            {
                GymId = gymId,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                PhoneNumber = request.PhoneNumber,
                DateOfBirth = request.DateOfBirth,
                Gender = request.Gender,
                EmergencyContactName = request.EmergencyContactName,
                EmergencyContactPhone = request.EmergencyContactPhone,
                BloodGroup = request.BloodGroup,
                Address = request.Address != null ? new Domain.Entities.Address
                {
                    Address1 = request.Address.Line1,
                    Address2 = request.Address.Line2,
                    City = request.Address.City,
                    State = request.Address.State,
                    Country = request.Address.Country,
                    PostalCode = request.Address.PostalCode
                } : null,
                MedicalConditions = request.MedicalConditions,
                FitnessGoals = request.FitnessGoals,
                JoiningDate = request.StartDate ?? DateTime.UtcNow,
                Status = MemberStatus.Active,
                MembershipNumber = $"MEM-{DateTime.UtcNow.Ticks.ToString().Substring(10)}",
                CreatedBy = createdBy,
                CreatedOn = DateTime.UtcNow
            };

            await _memberRepository.AddAsync(member);

            DateTime startDate = request.StartDate ?? DateTime.UtcNow;
            int duration = planTemplate.DurationMonths;
            int bonus = planTemplate.ExtendedMonths ?? 0;

            MemberSubscription subscription = new()
            {
                Member = member,
                GymPlanId = planTemplate.Id,
                PlanNameSnapshot = planTemplate.Name,
                PricePaid = planTemplate.IsOffer && planTemplate.DiscountedPrice.HasValue 
                            ? planTemplate.DiscountedPrice.Value 
                            : planTemplate.Price,
                DurationMonths = duration,
                ExtendedMonths = bonus,
                StartDate = startDate,
                EndDate = startDate.AddMonths(duration + bonus),
                IsActive = true,
                PaymentStatus = PaymentStatus.Paid,
                CreatedBy = createdBy,
                CreatedOn = DateTime.UtcNow
            };

            await _memberRepository.AddSubscriptionAsync(subscription);

            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<GymMemberResponse>(member);
        }

        public async Task<IEnumerable<GymMemberResponse>> GetGymMembersAsync(Guid gymId)
        {
            IEnumerable<GymMember> members = await _memberRepository.GetAllByGymIdAsync(gymId);
            return _mapper.Map<IEnumerable<GymMemberResponse>>(members);
        }

        public async Task<GymMemberResponse?> GetMemberByIdAsync(Guid id)
        {
            GymMember? member = await _memberRepository.GetByIdAsync(id);
            return member != null ? _mapper.Map<GymMemberResponse>(member) : null;
        }

        public async Task<GymMemberResponse> UpdateMemberAsync(Guid id, OnboardMemberRequest request, Guid updatedBy)
        {
            GymMember? member = await _memberRepository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Member not found");

            member.FirstName = request.FirstName;
            member.LastName = request.LastName;
            member.Email = request.Email;
            member.PhoneNumber = request.PhoneNumber;
            member.DateOfBirth = request.DateOfBirth;
            member.Gender = request.Gender;
            member.EmergencyContactName = request.EmergencyContactName;
            member.EmergencyContactPhone = request.EmergencyContactPhone;
            member.BloodGroup = request.BloodGroup;
            member.MedicalConditions = request.MedicalConditions;
            member.FitnessGoals = request.FitnessGoals;
            member.ModifiedBy = updatedBy;
            member.ModifiedOn = DateTime.UtcNow;

            if (request.Address != null)
            {
                if (member.Address == null) member.Address = new Domain.Entities.Address();
                member.Address.Address1 = request.Address.Line1;
                member.Address.Address2 = request.Address.Line2;
                member.Address.City = request.Address.City;
                member.Address.State = request.Address.State;
                member.Address.Country = request.Address.Country;
                member.Address.PostalCode = request.Address.PostalCode;
            }

            await _memberRepository.UpdateAsync(member);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<GymMemberResponse>(member);
        }

        public async Task<bool> ToggleMemberStatusAsync(Guid id)
        {
            GymMember? member = await _memberRepository.GetByIdAsync(id);
            if (member == null) return false;

            member.Status = member.Status == MemberStatus.Active ? MemberStatus.Inactive : MemberStatus.Active;
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> FreezeMemberAsync(Guid id, Guid updatedBy)
        {
            GymMember? member = await _memberRepository.GetByIdAsync(id);
            if (member == null) return false;

            member.Status = MemberStatus.Freeze;
            member.ModifiedBy = updatedBy;
            member.ModifiedOn = DateTime.UtcNow;
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UnfreezeMemberAsync(Guid id, Guid updatedBy)
        {
            GymMember? member = await _memberRepository.GetByIdAsync(id);
            if (member == null) return false;

            member.Status = MemberStatus.Active;
            member.ModifiedBy = updatedBy;
            member.ModifiedOn = DateTime.UtcNow;
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<GymMemberResponse> RenewSubscriptionAsync(Guid memberId, RenewSubscriptionRequest request, Guid updatedBy)
        {
            GymMember? member = await _memberRepository.GetByIdAsync(memberId)
                ?? throw new KeyNotFoundException("Member not found.");

            GymPlan? plan = await _planRepository.GetPlanByIdAsync(request.GymPlanId)
                ?? throw new KeyNotFoundException("The selected plan was not found.");

            await _memberRepository.DeactivateActiveSubscriptionsAsync(memberId);

            DateTime startDate = request.StartDate ?? DateTime.UtcNow;
            int duration = plan.DurationMonths;
            int bonus = plan.ExtendedMonths ?? 0;

            MemberSubscription renewal = new()
            {
                MemberId = memberId,
                GymPlanId = plan.Id,
                PlanNameSnapshot = plan.Name,
                PricePaid = plan.IsOffer && plan.DiscountedPrice.HasValue
                            ? plan.DiscountedPrice.Value
                            : plan.Price,
                DurationMonths = duration,
                ExtendedMonths = bonus,
                StartDate = startDate,
                EndDate = startDate.AddMonths(duration + bonus),
                IsActive = true,
                PaymentStatus = PaymentStatus.Paid,
                CreatedBy = updatedBy,
                CreatedOn = DateTime.UtcNow
            };

            await _memberRepository.AddSubscriptionAsync(renewal);

            if (member.Status == MemberStatus.Expired || member.Status == MemberStatus.Inactive)
            {
                member.Status = MemberStatus.Active;
                member.ModifiedBy = updatedBy;
                member.ModifiedOn = DateTime.UtcNow;
            }

            await _unitOfWork.SaveChangesAsync();

            GymMember? refreshed = await _memberRepository.GetByIdAsync(memberId);
            return _mapper.Map<GymMemberResponse>(refreshed!);
        }
    }
}
