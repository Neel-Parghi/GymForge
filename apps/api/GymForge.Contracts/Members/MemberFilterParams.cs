using System;
using GymForge.Contracts.Common;
using GymForge.Shared.Enums;

namespace GymForge.Contracts.Members
{
    public class MemberFilterParams : PaginationParams
    {
        public MemberStatus? Status { get; set; }
        public Guid? PlanId { get; set; }
        public PaymentStatus? PaymentStatus { get; set; }
    }
}
