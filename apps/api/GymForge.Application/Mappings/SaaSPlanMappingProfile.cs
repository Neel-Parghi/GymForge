using AutoMapper;
using GymForge.Contracts.SaaSPlan;
using GymForge.Domain.Entities;

namespace GymForge.Application.Mappings
{
    public class SaaSPlanMappingProfile : Profile
    {
        public SaaSPlanMappingProfile()
        {
            CreateMap<Plan,SaaSPlanDto>();

            CreateMap<CreateSaaSPlanDto,Plan>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.SubscriptionRecords, opt => opt.Ignore());

            CreateMap<UpdateSaaSPlanDto, Plan>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.SubscriptionRecords, opt => opt.Ignore());
        }
    }
}
