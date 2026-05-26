using System;
using System.ComponentModel.DataAnnotations.Schema;
using GymForge.Domain.Interface;

namespace GymForge.Domain.Entities
{
    public class StaffPayrollRule : BaseEntity, IBranchScoped
    {
        public Guid GymId { get; set; }
        public Guid? BranchId { get; set; }

        public Guid StaffId { get; set; }

        [ForeignKey("StaffId")]
        public virtual Staff Staff { get; set; } = null!;

        [Column(TypeName = "decimal(18,2)")]
        public decimal BaseSalary { get; set; } = 0;

        [Column(TypeName = "decimal(5,2)")]
        public decimal PTCommissionRate { get; set; } = 0;

        [Column(TypeName = "decimal(5,2)")]
        public decimal RehabCommissionRate { get; set; } = 0;
    }
}
