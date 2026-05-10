using GymForge.Application.DTOs.Inventory;
using GymForge.Application.Modules.Gym.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymForge.Api.Controllers.Gym
{
    [Route("api/inventory")]
    [Authorize(Roles = "GymOwner,Staff")]
    [ApiController]
    public class InventoryController : BaseApiController
    {
        private readonly IInventoryService _inventoryService;

        public InventoryController(IInventoryService inventoryService)
        {
            _inventoryService = inventoryService;
        }

        [HttpGet("stats")]
        public async Task<ActionResult<InventoryStatsDto>> GetInventoryStats()
        {
            if (GymId == null) return Unauthorized();
            return Ok(await _inventoryService.GetInventoryStatsAsync(GymId.Value));
        }

        // --- Products ---

        [HttpGet("products")]
        public async Task<ActionResult<List<InventoryItemDto>>> GetProducts()
        {
            if (GymId == null) return Unauthorized();
            return Ok(await _inventoryService.GetProductsAsync(GymId.Value));
        }

        [HttpPost("products")]
        public async Task<ActionResult<InventoryItemDto>> AddProduct([FromBody] CreateProductDto dto)
        {
            if (GymId == null) return Unauthorized();
            InventoryItemDto result = await _inventoryService.AddProductAsync(dto, GymId.Value);
            return Ok(result);
        }

        [HttpPut("products/{id}")]
        public async Task<ActionResult<InventoryItemDto>> UpdateProduct(Guid id, [FromBody] CreateProductDto dto)
        {
            InventoryItemDto? result = await _inventoryService.UpdateProductAsync(id, dto);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("products/{id}")]
        public async Task<ActionResult> DeleteProduct(Guid id)
        {
            await _inventoryService.DeleteProductAsync(id);
            return Ok(new { message = "Product deleted successfully" });
        }

        // --- Sales ---

        [HttpPost("sales")]
        public async Task<ActionResult> RecordSale([FromBody] RecordSaleDto dto)
        {
            if (GymId == null) return Unauthorized();
            bool success = await _inventoryService.RecordSaleAsync(dto, GymId.Value);
            if (!success) return BadRequest(new { message = "Sale failed. Check stock availability." });
            return Ok(new { message = "Sale recorded successfully" });
        }

        [HttpGet("sales/history")]
        public async Task<ActionResult<List<SaleTransactionDto>>> GetSalesHistory()
        {
            if (GymId == null) return Unauthorized();
            return Ok(await _inventoryService.GetSalesHistoryAsync(GymId.Value));
        }
    }
}
