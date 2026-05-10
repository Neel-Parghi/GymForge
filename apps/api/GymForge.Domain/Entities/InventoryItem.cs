using System.ComponentModel.DataAnnotations.Schema;

namespace GymForge.Domain.Entities
{
    public class InventoryItem : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty; // Supplements, Apparel, etc.
        public string? Description { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal BuyingPrice { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal SellingPrice { get; set; }
        
        public int StockQuantity { get; set; }
        public int ReorderLevel { get; set; } = 5;
        public string? ImageUrl { get; set; }
        public bool IsActive { get; set; } = true;

        public Guid GymId { get; set; }
        
        [ForeignKey("GymId")]
        public virtual Gym Gym { get; set; } = null!;
    }
}
