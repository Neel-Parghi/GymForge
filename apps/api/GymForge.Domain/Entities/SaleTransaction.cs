using System.ComponentModel.DataAnnotations.Schema;

namespace GymForge.Domain.Entities
{
    public class SaleTransaction : BaseEntity
    {
        public Guid MemberId { get; set; }
        
        [ForeignKey("MemberId")]
        public virtual GymMember Member { get; set; } = null!;

        public Guid InventoryItemId { get; set; }

        [ForeignKey("InventoryItemId")]
        public virtual InventoryItem InventoryItem { get; set; } = null!;

        public int Quantity { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        public string PaymentMethod { get; set; } = "Card"; // Cash, Card, UPI
        public DateTime TransactionDate { get; set; } = DateTime.UtcNow;

        public Guid GymId { get; set; }

        [ForeignKey("GymId")]
        public virtual Gym Gym { get; set; } = null!;
    }
}
