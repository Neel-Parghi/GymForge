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

        // --- Equipment ---

        [HttpGet("equipment")]
        public async Task<ActionResult<List<EquipmentDto>>> GetEquipment()
        {
            if (GymId == null) return Unauthorized();
            return Ok(await _inventoryService.GetEquipmentAsync(GymId.Value));
        }

        [HttpPost("equipment")]
        public async Task<ActionResult<EquipmentDto>> AddEquipment([FromBody] CreateEquipmentDto dto)
        {
            if (GymId == null) return Unauthorized();
            EquipmentDto result = await _inventoryService.AddEquipmentAsync(dto, GymId.Value);
            return Ok(result);
        }

        [HttpPut("equipment/{id}")]
        public async Task<ActionResult> UpdateEquipment(Guid id, [FromBody] CreateEquipmentDto dto)
        {
            bool success = await _inventoryService.UpdateEquipmentAsync(id, dto);
            if (!success) return NotFound();
            return Ok(new { message = "Equipment updated successfully" });
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

        // --- Maintenance ---

        [HttpGet("maintenance/history")]
        public async Task<ActionResult<List<MaintenanceLogDto>>> GetAllMaintenanceHistory()
        {
            if (GymId == null) return Unauthorized();
            return Ok(await _inventoryService.GetAllMaintenanceLogsAsync(GymId.Value));
        }

        [HttpPost("maintenance")]
        public async Task<ActionResult> LogMaintenance([FromBody] LogMaintenanceDto dto)
        {
            bool success = await _inventoryService.LogMaintenanceAsync(dto);
            if (!success) return BadRequest(new { message = "Failed to log maintenance" });
            return Ok(new { message = "Maintenance logged successfully" });
        }

        [HttpPut("maintenance/{id}")]
        public async Task<ActionResult> UpdateMaintenance(Guid id, [FromBody] LogMaintenanceDto dto)
        {
            dto.Id = id;
            bool success = await _inventoryService.LogMaintenanceAsync(dto);
            if (!success) return BadRequest(new { message = "Failed to update maintenance" });
            return Ok(new { message = "Maintenance updated successfully" });
        }

        [HttpGet("equipment/{id}/maintenance")]
        public async Task<ActionResult<List<MaintenanceLogDto>>> GetMaintenanceHistory(Guid id)
        {
            return Ok(await _inventoryService.GetMaintenanceHistoryAsync(id));
        }
    }
}
