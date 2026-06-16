using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;

namespace CMS.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OrdersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/orders
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _context.Orders
                .Include(o => o.Customer)
                .OrderByDescending(o => o.OrderDate)
                .Select(o => new
                {
                    o.Id,
                    o.OrderDate,
                    o.CustomerId,
                    CustomerName = o.Customer != null ? o.Customer.FullName : null,
                    o.Status,
                    o.Notes
                })
                .ToListAsync();
            return Ok(list);
        }

        // GET: api/orders/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var order = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderDetails!)
                    .ThenInclude(d => d.Product)
                .Select(o => new
                {
                    o.Id,
                    o.OrderDate,
                    o.CustomerId,
                    CustomerName = o.Customer != null ? o.Customer.FullName : null,
                    CustomerPhone = o.Customer != null ? o.Customer.Phone : null,
                    CustomerEmail = o.Customer != null ? o.Customer.Email : null,
                    CustomerAddress = o.Customer != null ? o.Customer.Address : null,
                    o.Status,
                    o.Notes,
                    Details = o.OrderDetails != null ? o.OrderDetails.Select(d => new
                    {
                        d.Id,
                        d.ProductId,
                        ProductName = d.Product != null ? d.Product.Name : null,
                        d.Quantity,
                        d.UnitPrice,
                        TotalPrice = d.Quantity * d.UnitPrice
                    }) : null
                })
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound(new { message = "Không tìm thấy đơn hàng" });
            }
            return Ok(order);
        }

        // POST: api/orders
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Order order)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Kiểm tra khách hàng tồn tại
            var customerExists = await _context.Customers.AnyAsync(c => c.Id == order.CustomerId);
            if (!customerExists)
            {
                return BadRequest(new { message = "Khách hàng không tồn tại" });
            }

            // Nếu đơn hàng có kèm chi tiết, kiểm tra sản phẩm và gán giá
            if (order.OrderDetails != null && order.OrderDetails.Any())
            {
                foreach (var detail in order.OrderDetails)
                {
                    var product = await _context.Products.FindAsync(detail.ProductId);
                    if (product == null)
                    {
                        return BadRequest(new { message = $"Sản phẩm với ID {detail.ProductId} không tồn tại" });
                    }

                    // Tự động gán giá sản phẩm tại thời điểm mua nếu chưa có
                    if (detail.UnitPrice <= 0)
                    {
                        detail.UnitPrice = product.Price;
                    }

                    // Trừ số lượng kho
                    if (product.StockQuantity < detail.Quantity)
                    {
                        return BadRequest(new { message = $"Sản phẩm {product.Name} không đủ số lượng trong kho (Còn lại: {product.StockQuantity})" });
                    }
                    product.StockQuantity -= detail.Quantity;
                }
            }

            order.OrderDate = DateTime.Now;
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
        }

        // PUT: api/orders/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Order order)
        {
            if (id != order.Id)
            {
                return BadRequest(new { message = "ID không trùng khớp" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingOrder = await _context.Orders.FindAsync(id);
            if (existingOrder == null)
            {
                return NotFound(new { message = "Không tìm thấy đơn hàng" });
            }

            // Chỉ cho phép cập nhật trạng thái và ghi chú trên API chính của Order
            existingOrder.Status = order.Status;
            existingOrder.Notes = order.Notes;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Orders.Any(o => o.Id == id))
                {
                    return NotFound(new { message = "Không tìm thấy đơn hàng để cập nhật" });
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/orders/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound(new { message = "Không tìm thấy đơn hàng" });
            }

            // Hoàn lại kho cho các sản phẩm trong đơn hàng bị xóa (nếu đơn chưa hoàn thành)
            if (order.Status != 2 && order.OrderDetails != null)
            {
                foreach (var detail in order.OrderDetails)
                {
                    var product = await _context.Products.FindAsync(detail.ProductId);
                    if (product != null)
                    {
                        product.StockQuantity += detail.Quantity;
                    }
                }
            }

            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Xóa đơn hàng thành công" });
        }
    }
}
