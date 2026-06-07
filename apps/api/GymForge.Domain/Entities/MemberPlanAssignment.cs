namespace GymForge.Domain.Entities
{
    public class MemberPlanAssignment : BaseEntity
    {
        public Guid MemberId { get; set; }
        public Guid WorkoutPlanId { get; set; }
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;
        
        public GymMember Member { get; set; } = null!;
        public WorkoutPlan WorkoutPlan { get; set; } = null!;

        public ICollection<MemberWorkoutScheduleDay> CustomScheduleDays { get; set; } = [];
    }
}
