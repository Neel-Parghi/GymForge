using AutoMapper;
using GymForge.Contracts.Auth;
using GymForge.Contracts.Gym.Owners;
using GymForge.Domain.Entities;

namespace GymForge.Application.Mappings
{
    public class UserMappingProfile : Profile
    {
        public UserMappingProfile() 
        {
            CreateMap<RegisterRequestDto, User>();

            CreateMap<User, AuthResponseDto>();

            CreateMap<UpdateGymOwnerDto, User>();

            CreateMap<User, GymOwnersDto>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => $"{src.FirstName} {src.LastName}"));
        }
    }
}
