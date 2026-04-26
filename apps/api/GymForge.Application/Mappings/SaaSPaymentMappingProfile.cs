using AutoMapper;
using GymForge.Contracts.SaaSPayments;
using GymForge.Contracts.SuperAdmin.Configuration;
using GymForge.Domain.Entities;

namespace GymForge.Application.Mappings
{
    public class SaaSPaymentMappingProfile : Profile
    {
        public SaaSPaymentMappingProfile()
        {
            CreateMap<SaaSConfiguration, SaaSConfigurationDto>().ReverseMap();
        }
    }
}
