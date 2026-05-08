using AutoMapper;
using GymForge.Contracts.Staff;
using GymForge.Domain.Entities;

namespace GymForge.Application.Mappings
{
    public class StaffMappingProfile : Profile
    {
        public StaffMappingProfile()
        {
            CreateMap<AddStaffRequest, Staff>();
            CreateMap<Staff, StaffResponse>();
            
            CreateMap<MemberMeasurement, MeasurementResponse>()
                .ForMember(dest => dest.RecordedBy, opt => opt.MapFrom(src => src.RecordedBy != null ? $"{src.RecordedBy.FirstName} {src.RecordedBy.LastName}" : "Unknown"));
        }
    }
}
