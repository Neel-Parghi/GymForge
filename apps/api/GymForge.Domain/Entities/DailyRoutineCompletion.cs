using System;
using System.Collections.Generic;

namespace GymForge.Domain.Entities
{
    public class DailyRoutineCompletion : BaseEntity
    {
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
        public DateTime Date { get; set; }
        public List<Guid> CompletedRoutineIds { get; set; } = new();
    }
}
