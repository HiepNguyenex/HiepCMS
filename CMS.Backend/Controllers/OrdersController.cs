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
        private readonly Services.IEmailService _emailService;

        public OrdersController(ApplicationDbContext context, Services.IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        // GET: api/orders
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] int? customerId, 
            [FromQuery] int? status, 
            [FromQuery] string? search,
            [FromQuery] DateTime? minDate,
            [FromQuery] DateTime? maxDate,
            [FromQuery] string? sortBy,
            [FromQuery] bool? isDescending,
            [FromQuery] int? page,
            [FromQuery] int? pageSize)
        {
            var query = _context.Orders.AsQueryable();
            if (customerId.HasValue)
            {
                query = query.Where(o => o.CustomerId == customerId.Value);
            }

            if (status.HasValue)
            {
                query = query.Where(o => o.Status == status.Value);
            }

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(o => (o.Notes != null && o.Notes.Contains(search)) || 
                                         (o.Customer != null && o.Customer.FullName.Contains(search)));
            }

            if (minDate.HasValue)
            {
                query = query.Where(o => o.OrderDate >= minDate.Value);
            }

            if (maxDate.HasValue)
            {
                query = query.Where(o => o.OrderDate <= maxDate.Value);
            }

            if (!string.IsNullOrEmpty(sortBy))
            {
                switch (sortBy.ToLower())
                {
                    case "orderdate":
                        query = isDescending == true ? query.OrderByDescending(o => o.OrderDate) : query.OrderBy(o => o.OrderDate);
                        break;
                    case "status":
                        query = isDescending == true ? query.OrderByDescending(o => o.Status) : query.OrderBy(o => o.Status);
                        break;
                    case "id":
                    default:
                        query = isDescending == true ? query.OrderByDescending(o => o.Id) : query.OrderBy(o => o.Id);
                        break;
                }
            }
            else
            {
                query = query.OrderByDescending(o => o.OrderDate);
            }

            if (page.HasValue && pageSize.HasValue && page.Value > 0 && pageSize.Value > 0)
            {
                query = query.Skip((page.Value - 1) * pageSize.Value).Take(pageSize.Value);
            }

            var list = await query
                .Include(o => o.Customer)
                .Select(o => new
                {
                    o.Id,
                    o.OrderDate,
                    o.CustomerId,
                    CustomerName = o.Customer != null ? o.Customer.FullName : null,
                    o.Status,
                    o.Notes,
                    TotalAmount = o.OrderDetails != null ? o.OrderDetails.Sum(d => d.Quantity * d.UnitPrice) : 0
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

            // Gửi email xác nhận đơn hàng thành công cho khách hàng
            try
            {
                var customer = await _context.Customers.FindAsync(order.CustomerId);
                if (customer != null && !string.IsNullOrEmpty(customer.Email))
                {
                    var itemsHtml = "";
                    decimal total = 0;
                    var details = await _context.OrderDetails
                        .Include(d => d.Product)
                        .Where(d => d.OrderId == order.Id)
                        .ToListAsync();

                    foreach (var item in details)
                    {
                        var name = item.Product?.Name ?? $"Sản phẩm #{item.ProductId}";
                        var subtotal = item.Quantity * item.UnitPrice;
                        total += subtotal;
                        itemsHtml += $@"
                            <tr>
                                <td style='padding: 10px; border: 1px solid #ddd;'>{name}</td>
                                <td style='padding: 10px; border: 1px solid #ddd; text-align: center;'>{item.Quantity}</td>
                                <td style='padding: 10px; border: 1px solid #ddd; text-align: right;'>{item.UnitPrice:N0} đ</td>
                                <td style='padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold;'>{subtotal:N0} đ</td>
                            </tr>";
                    }

                    var emailBody = $@"
                        <div style='font-family: ""Segoe UI"", Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);'>
                            <div style='background: linear-gradient(135deg, #d4af37 0%, #aa8c2c 100%); color: white; padding: 25px; text-align: center;'>
                                <h2 style='margin: 0; font-size: 24px; letter-spacing: 1px;'>HIEPCMS PERFUME SHOP</h2>
                                <p style='margin: 5px 0 0 0; opacity: 0.9;'>Xác Nhận Đơn Hàng Thành Công</p>
                            </div>
                            <div style='padding: 25px; background-color: #ffffff;'>
                                <p>Xin chào <strong>{customer.FullName}</strong>,</p>
                                <p>Cảm ơn bạn đã tin tưởng và đặt mua sản phẩm tại cửa hàng chúng tôi. Đơn hàng của bạn đã được tiếp nhận và đang chờ bộ phận quản trị xác nhận.</p>
                                
                                <div style='background-color: #f9f9f9; padding: 15px; border-left: 4px solid #d4af37; margin: 20px 0; border-radius: 4px;'>
                                    <p style='margin: 0 0 8px 0;'><strong>Mã đơn hàng:</strong> #{order.Id}</p>
                                    <p style='margin: 0 0 8px 0;'><strong>Ngày đặt:</strong> {order.OrderDate:dd/MM/yyyy HH:mm}</p>
                                    <p style='margin: 0 0 8px 0;'><strong>Trạng thái:</strong> <span style='background-color: #6c757d; color: white; padding: 3px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;'>Chờ xác nhận</span></p>
                                    <p style='margin: 0;'><strong>Địa chỉ giao hàng:</strong> {customer.Address ?? "-"}</p>
                                </div>
                                
                                <h3 style='color: #aa8c2c; border-bottom: 2px solid #f0f0f0; padding-bottom: 8px; margin-top: 25px;'>Chi Tiết Đơn Hàng</h3>
                                <table style='width: 100%; border-collapse: collapse; margin-top: 10px;'>
                                    <thead>
                                        <tr style='background-color: #f2f2f2;'>
                                            <th style='padding: 10px; border: 1px solid #ddd; text-align: left;'>Sản phẩm</th>
                                            <th style='padding: 10px; border: 1px solid #ddd; text-align: center; width: 15%;'>SL</th>
                                            <th style='padding: 10px; border: 1px solid #ddd; text-align: right; width: 25%;'>Đơn giá</th>
                                            <th style='padding: 10px; border: 1px solid #ddd; text-align: right; width: 25%;'>Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {itemsHtml}
                                    </tbody>
                                    <tfoot>
                                        <tr style='background-color: #fffaf0;'>
                                            <td colspan='3' style='padding: 12px; border: 1px solid #ddd; text-align: right; font-weight: bold;'>Tổng thanh toán:</td>
                                            <td style='padding: 12px; border: 1px solid #ddd; text-align: right; font-weight: bold; color: #d9534f; font-size: 16px;'>{total:N0} đ</td>
                                        </tr>
                                    </tfoot>
                                </table>
                                
                                <div style='margin-top: 30px; border-top: 1px solid #eeeeee; padding-top: 15px; text-align: center; color: #777; font-size: 12px;'>
                                    <p style='margin: 0;'>Cửa hàng HiepCMS Perfume Shop hân hạnh được phục vụ quý khách!</p>
                                    <p style='margin: 5px 0 0 0;'>Hotline: 0909.XXX.XXX | Email: support@hiepcms.com</p>
                                </div>
                            </div>
                        </div>";

                    // Gửi email bất đồng bộ không làm chậm UI
                    _ = Task.Run(async () => {
                        await _emailService.SendEmailAsync(customer.Email, $"[HiepCMS] Xác nhận đơn hàng #{order.Id} thành công", emailBody);
                    });
                }
            }
            catch (Exception)
            {
                // Bỏ qua lỗi gửi mail để không ảnh hưởng đến API đặt hàng thành công
            }

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
