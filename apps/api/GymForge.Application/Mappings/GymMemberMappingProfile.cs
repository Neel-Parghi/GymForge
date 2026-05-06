using AutoMapper;
using GymForge.Contracts.Members;
using GymForge.Domain.Entities;

namespace GymForge.Application.Mappings
{
    public class GymMemberMappingProfile : Profile
    {
        public GymMemberMappingProfile()
        {
            CreateMap<GymMember, GymMemberResponse>()
                .ForMember(dest => dest.CurrentSubscription, 
                           opt => opt.MapFrom(src => src.Subscriptions
                                                        .OrderByDescending(s => s.CreatedOn)
                                                        .FirstOrDefault(s => s.IsActive)));

            CreateMap<MemberSubscription, MemberSubscriptionResponse>();

            CreateMap<Address, GymForge.Contracts.Gym.Shared.AddressDto>()
                .ForMember(dest => dest.Line1, opt => opt.MapFrom(src => src.Address1))
                .ForMember(dest => dest.Line2, opt => opt.MapFrom(src => src.Address2));
        }
    }
}
