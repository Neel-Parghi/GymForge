using AutoMapper;
using GymForge.Contracts.WorkoutPlan;
using GymForge.Domain.Entities;

namespace GymForge.Application.Mappings
{
    public class WorkoutPlanMappingProfile : Profile
    {
        public WorkoutPlanMappingProfile()
        {
            // Response Mappings
            CreateMap<WorkoutPlan, WorkoutPlanDto>();
            CreateMap<WorkoutPlanDay, WorkoutPlanDayDto>();
            CreateMap<WorkoutPlanExercise, WorkoutPlanExerciseDto>();

            // Request Mappings
            CreateMap<CreateWorkoutPlanRequest, WorkoutPlan>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedOn, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedBy, opt => opt.Ignore());

            CreateMap<CreateWorkoutPlanDayDto, WorkoutPlanDay>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.WorkoutPlanId, opt => opt.Ignore())
                .ForMember(dest => dest.WorkoutPlan, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedOn, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedBy, opt => opt.Ignore());

            CreateMap<CreateWorkoutPlanExerciseDto, WorkoutPlanExercise>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.WorkoutPlanDayId, opt => opt.Ignore())
                .ForMember(dest => dest.WorkoutPlanDay, opt => opt.Ignore())
                .ForMember(dest => dest.Exercise, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedOn, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedBy, opt => opt.Ignore());

            CreateMap<UpdateWorkoutPlanRequest, WorkoutPlan>()
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedOn, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedBy, opt => opt.Ignore());
        }
    }
}
