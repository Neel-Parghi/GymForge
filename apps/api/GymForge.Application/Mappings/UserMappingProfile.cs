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

            CreateMap<User, GymForge.Contracts.Users.UserProfileDto>();

            CreateMap<GymForge.Contracts.Users.UpdateUserProfileDto, User>()
                .ForMember(dest => dest.Address, opt => opt.MapFrom(src => src));

            CreateMap<GymForge.Contracts.Users.UpdateUserProfileDto, Address>()
                .ForMember(dest => dest.Address1, opt => opt.MapFrom(src => src.AddressLine1))
                .ForMember(dest => dest.Address2, opt => opt.MapFrom(src => src.AddressLine2))
                .ForMember(dest => dest.PostalCode, opt => opt.MapFrom(src => src.ZipCode));
        }
    }
}
