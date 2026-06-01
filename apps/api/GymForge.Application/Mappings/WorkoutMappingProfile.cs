using AutoMapper;
using GymForge.Contracts.Workout;
using GymForge.Domain.Entities;

namespace GymForge.Application.Mappings
{
    public class WorkoutMappingProfile : Profile
    {
        public WorkoutMappingProfile()
        {
            CreateMap<Exercise, ExerciseDto>();
        }
    }
}
