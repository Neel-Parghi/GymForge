using System.ComponentModel.DataAnnotations.Schema;

namespace GymForge.Domain.Entities
{
    public class GymConfiguration : BaseEntity
    {
        public Guid GymId { get; set; }

        public int PlanExpirationTriggerDays { get; set; } = 7;

        [ForeignKey(nameof(GymId))]
        public Gym Gym { get; set; } = null!;
    }
}
