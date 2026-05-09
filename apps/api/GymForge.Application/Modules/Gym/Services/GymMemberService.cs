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
        private readonly IAddressRepository _addressRepository;

        public GymMemberService(IGymMemberRepository memberRepository, IGymPlanRepository planRepository, IMapper mapper, IUnitOfWork unitOfWork, IAddressRepository addressRepository)
        {
            _memberRepository = memberRepository;
            _planRepository = planRepository;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
            _addressRepository = addressRepository;
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

            GymMember member = _mapper.Map<GymMember>(request);
            member.GymId = gymId;
            member.JoiningDate = request.StartDate ?? DateTime.UtcNow;
            member.Status = MemberStatus.Active;
            member.MembershipNumber = $"MEM-{DateTime.UtcNow.Ticks.ToString().Substring(10)}";
            member.CreatedBy = createdBy;
            member.CreatedOn = DateTime.UtcNow;
            
            if (member.Address != null)
            {
                member.Address.Id = Guid.NewGuid();
                member.Address.CreatedOn = DateTime.UtcNow;
            }

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
                PaymentStatus = request.PaymentStatus ?? PaymentStatus.Paid,
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

            _mapper.Map(request, member);
            member.ModifiedBy = updatedBy;
            member.ModifiedOn = DateTime.UtcNow;

            if (request.Address != null)
            {
                if (member.Address == null)
                {
                    member.Address = _mapper.Map<Address>(request.Address);
                    await _addressRepository.AddAsync(member.Address);
                }
                else
                {
                    _mapper.Map(request.Address, member.Address);
                }
            }

            if (request.PaymentStatus.HasValue)
            {
                MemberSubscription? activeSub = member.Subscriptions.OrderByDescending(s => s.CreatedOn).FirstOrDefault(s => s.IsActive);
                if (activeSub != null)
                {
                    activeSub.PaymentStatus = request.PaymentStatus.Value;
                    activeSub.ModifiedBy = updatedBy;
                    activeSub.ModifiedOn = DateTime.UtcNow;
                }
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
                PaymentStatus = request.PaymentStatus ?? PaymentStatus.Paid,
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

        public async Task<bool> DeleteMemberAsync(Guid id)
        {
            await _memberRepository.DeleteAsync(id);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<MemberSubscriptionResponse>> GetSubscriptionHistoryAsync(Guid memberId)
        {
            GymMember? member = await _memberRepository.GetByIdAsync(memberId);
            if (member == null) return Enumerable.Empty<MemberSubscriptionResponse>();

            IOrderedEnumerable<MemberSubscription> subscriptions = member.Subscriptions.OrderByDescending(s => s.StartDate);
            return _mapper.Map<IEnumerable<MemberSubscriptionResponse>>(subscriptions);
        }

        public async Task<byte[]> ExportMembersAsync(Guid gymId)
        {
            IEnumerable<GymMember> members = await _memberRepository.GetAllByGymIdAsync(gymId);
            
            using var sw = new StringWriter();
            sw.WriteLine("MembershipID,FirstName,LastName,Email,Phone,Gender,Status,JoiningDate,CurrentPlan,PlanExpiry");

            foreach (var m in members)
            {
                MemberSubscription? sub = m.Subscriptions.OrderByDescending(s => s.CreatedOn).FirstOrDefault(s => s.IsActive);
                sw.WriteLine($"{m.MembershipNumber},{m.FirstName},{m.LastName},{m.Email},{m.PhoneNumber},{m.Gender},{m.Status},{m.JoiningDate:yyyy-MM-dd},{sub?.PlanNameSnapshot ?? "N/A"},{sub?.EndDate:yyyy-MM-dd}");
            }

            return System.Text.Encoding.UTF8.GetBytes(sw.ToString());
        }
    }
}
