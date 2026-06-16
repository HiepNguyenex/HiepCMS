using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;

namespace CMS.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderDetailsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OrderDetailsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/orderdetails
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _context.OrderDetails
                .Include(d => d.Product)
                .Select(d => new
                {
                    d.Id,
                    d.OrderId,
                    d.ProductId,
                    ProductName = d.Product != null ? d.Product.Name : null,
                    d.Quantity,
                    d.UnitPrice,
                    TotalPrice = d.Quantity * d.UnitPrice
                })
                .ToListAsync();
            return Ok(list);
        }

        // GET: api/orderdetails/order/5
        [HttpGet("order/{orderId}")]
        public async Task<IActionResult> GetByOrderId(int orderId)
        {
            var list = await _context.OrderDetails
                .Include(d => d.Product)
                .Where(d => d.OrderId == orderId)
                .Select(d => new
                {
                    d.Id,
                    d.OrderId,
                    d.ProductId,
                    ProductName = d.Product != null ? d.Product.Name : null,
                    d.Quantity,
                    d.UnitPrice,
                    TotalPrice = d.Quantity * d.UnitPrice
                })
                .ToListAsync();
            return Ok(list);
        }

        // GET: api/orderdetails/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var detail = await _context.OrderDetails
                .Include(d => d.Product)
                .Select(d => new
                {
                    d.Id,
                    d.OrderId,
                    d.ProductId,
                    ProductName = d.Product != null ? d.Product.Name : null,
                    d.Quantity,
                    d.UnitPrice,
                    TotalPrice = d.Quantity * d.UnitPrice
                })
                .FirstOrDefaultAsync(d => d.Id == id);

            if (detail == null)
            {
                return NotFound(new { message = "Không tìm thấy chi tiết đơn hàng" });
            }
            return Ok(detail);
        }

        // POST: api/orderdetails
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] OrderDetail detail)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Kiểm tra Order tồn tại
            var orderExists = await _context.Orders.AnyAsync(o => o.Id == detail.OrderId);
            if (!orderExists)
            {
                return BadRequest(new { message = "Đơn hàng không tồn tại" });
            }

            // Kiểm tra Product tồn tại
            var product = await _context.Products.FindAsync(detail.ProductId);
            if (product == null)
            {
                return BadRequest(new { message = "Sản phẩm không tồn tại" });
            }

            // Kiểm tra số lượng kho
            if (product.StockQuantity < detail.Quantity)
            {
                return BadRequest(new { message = $"Sản phẩm {product.Name} không đủ số lượng trong kho (Còn lại: {product.StockQuantity})" });
            }

            // Tự động gán giá sản phẩm tại thời điểm mua nếu chưa nhập
            if (detail.UnitPrice <= 0)
            {
                detail.UnitPrice = product.Price;
            }

            // Trừ kho
            product.StockQuantity -= detail.Quantity;

            _context.OrderDetails.Add(detail);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = detail.Id }, detail);
        }

        // PUT: api/orderdetails/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] OrderDetail detail)
        {
            if (id != detail.Id)
            {
                return BadRequest(new { message = "ID không trùng khớp" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingDetail = await _context.OrderDetails.FindAsync(id);
            if (existingDetail == null)
            {
                return NotFound(new { message = "Không tìm thấy chi tiết đơn hàng" });
            }

            // Kiểm tra nếu sản phẩm bị đổi
            if (existingDetail.ProductId != detail.ProductId)
            {
                return BadRequest(new { message = "Không thể thay đổi sản phẩm trong chi tiết đơn hàng cũ, vui lòng xóa và thêm mới dòng khác." });
            }

            var product = await _context.Products.FindAsync(detail.ProductId);
            if (product != null)
            {
                // Tính toán chênh lệch số lượng để hoàn trả hoặc giảm kho sản phẩm
                int quantityDiff = detail.Quantity - existingDetail.Quantity;
                if (quantityDiff > 0)
                {
                    // Tăng số lượng mua -> cần trừ thêm trong kho
                    if (product.StockQuantity < quantityDiff)
                    {
                        return BadRequest(new { message = $"Sản phẩm không đủ số lượng trong kho để tăng thêm {quantityDiff} đơn vị (Kho còn: {product.StockQuantity})" });
                    }
                    product.StockQuantity -= quantityDiff;
                }
                else if (quantityDiff < 0)
                {
                    // Giảm số lượng mua -> hoàn lại kho sản phẩm
                    product.StockQuantity += Math.Abs(quantityDiff);
                }
            }

            existingDetail.Quantity = detail.Quantity;
            if (detail.UnitPrice > 0)
            {
                existingDetail.UnitPrice = detail.UnitPrice;
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.OrderDetails.Any(d => d.Id == id))
                {
                    return NotFound(new { message = "Không tìm thấy chi tiết đơn hàng" });
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/orderdetails/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var detail = await _context.OrderDetails.FindAsync(id);
            if (detail == null)
            {
                return NotFound(new { message = "Không tìm thấy chi tiết đơn hàng" });
            }

            // Hoàn lại kho cho sản phẩm
            var product = await _context.Products.FindAsync(detail.ProductId);
            if (product != null)
            {
                product.StockQuantity += detail.Quantity;
            }

            _context.OrderDetails.Remove(detail);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa chi tiết đơn hàng thành công" });
        }
    }
}
