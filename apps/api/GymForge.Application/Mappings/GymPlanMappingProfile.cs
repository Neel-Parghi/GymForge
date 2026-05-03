using AutoMapper;
using GymForge.Contracts.GymPlans;
using GymForge.Domain.Entities;

namespace GymForge.Application.Mappings
{
    public class GymPlanMappingProfile : Profile
    {
        public GymPlanMappingProfile() 
        {
            CreateMap<CreateGymPlanRequest, GymPlan>()
                .ForMember(dest => dest.Id, opt => opt.Ignore());

            CreateMap<UpdateGymPlanRequest, GymPlan>();

            CreateMap<GymPlan, GymPlanDto>();
        }
    }
}
