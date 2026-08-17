using GymForge.Application.Modules.Gym.Services;
using GymForge.Domain.Entities;
using GymForge.Domain.Interface;

using Microsoft.Extensions.Logging;

namespace GymForge.Application.BackgroundJobs
{
    public class MemberAutoUnfreezeJob
    {
        private readonly IGymMemberRepository _memberRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<MemberAutoUnfreezeJob> _logger;

        public MemberAutoUnfreezeJob(IGymMemberRepository memberRepository, IUnitOfWork unitOfWork, ILogger<MemberAutoUnfreezeJob> logger)
        {
            _memberRepository = memberRepository;
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task ExecuteAsync()
        {
            _logger.LogInformation("MemberAutoUnfreezeJob started.");

            DateTime now = DateTime.UtcNow;
            List<GymMember> dueMembers = (await _memberRepository.GetMembersDueForUnfreezeAsync(now)).ToList();

            foreach (GymMember member in dueMembers)
            {
                MemberFreezeCalculator.Unfreeze(member, now);
                member.ModifiedOn = now;
                await _memberRepository.UpdateAsync(member);
            }

            if (dueMembers.Count > 0)
            {
                await _unitOfWork.SaveChangesAsync();
            }

            _logger.LogInformation($"MemberAutoUnfreezeJob completed. Unfroze {dueMembers.Count} member(s).");
        }
    }
}
