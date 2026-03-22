using AutoMapper;
using GymForge.Contracts.Auth;
using GymForge.Domain.Entities;

namespace GymForge.Application.Mappings
{
    public class UserMappingProfile : Profile
    {
        public UserMappingProfile() 
        {
            CreateMap<RegisterRequestDto, User>();

            CreateMap<User, AuthResponseDto>();
        }
    }
}
