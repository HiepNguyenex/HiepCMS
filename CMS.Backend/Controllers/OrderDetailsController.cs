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
        private readonly Services.IEmailService _emailService;

        public OrderDetailsController(ApplicationDbContext context, Services.IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        // GET: api/orderdetails
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] int? orderId, 
            [FromQuery] int? productId,
            [FromQuery] string? sortBy,
            [FromQuery] bool? isDescending,
            [FromQuery] int? page,
            [FromQuery] int? pageSize)
        {
            var query = _context.OrderDetails.AsQueryable();

            if (orderId.HasValue)
            {
                query = query.Where(d => d.OrderId == orderId.Value);
            }

            if (productId.HasValue)
            {
                query = query.Where(d => d.ProductId == productId.Value);
            }

            if (!string.IsNullOrEmpty(sortBy))
            {
                switch (sortBy.ToLower())
                {
                    case "unitprice":
                        query = isDescending == true ? query.OrderByDescending(d => d.UnitPrice) : query.OrderBy(d => d.UnitPrice);
                        break;
                    case "quantity":
                        query = isDescending == true ? query.OrderByDescending(d => d.Quantity) : query.OrderBy(d => d.Quantity);
                        break;
                    case "id":
                    default:
                        query = isDescending == true ? query.OrderByDescending(d => d.Id) : query.OrderBy(d => d.Id);
                        break;
                }
            }
            else
            {
                query = query.OrderBy(d => d.Id);
            }

            if (page.HasValue && pageSize.HasValue && page.Value > 0 && pageSize.Value > 0)
            {
                query = query.Skip((page.Value - 1) * pageSize.Value).Take(pageSize.Value);
            }

            var list = await query
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
            string productName = product != null ? product.Name : $"Sản phẩm #{detail.ProductId}";
            if (product != null)
            {
                product.StockQuantity += detail.Quantity;
            }

            int orderId = detail.OrderId;
            int removedQty = detail.Quantity;
            decimal removedPrice = detail.UnitPrice;

            _context.OrderDetails.Remove(detail);
            await _context.SaveChangesAsync();

            // Gửi email thông báo cho khách hàng về việc điều chỉnh sản phẩm lỗi
            try
            {
                var order = await _context.Orders
                    .Include(o => o.Customer)
                    .FirstOrDefaultAsync(o => o.Id == orderId);

                if (order != null && order.Customer != null && !string.IsNullOrEmpty(order.Customer.Email))
                {
                    var itemsHtml = "";
                    decimal total = 0;
                    var remainingDetails = await _context.OrderDetails
                        .Include(d => d.Product)
                        .Where(d => d.OrderId == orderId)
                        .ToListAsync();

                    foreach (var item in remainingDetails)
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
                                <p style='margin: 5px 0 0 0; opacity: 0.9;'>Thông Báo Điều Chỉnh Đơn Hàng</p>
                            </div>
                            <div style='padding: 25px; background-color: #ffffff;'>
                                <p>Xin chào <strong>{order.Customer.FullName}</strong>,</p>
                                <p>Chúng tôi xin thông báo đã thực hiện điều chỉnh đơn hàng <strong>#{orderId}</strong> của bạn để loại bỏ sản phẩm bị lỗi hoặc hết hàng:</p>
                                
                                <div style='background-color: #fff0f0; border-left: 4px solid #d9534f; padding: 15px; margin: 15px 0; border-radius: 4px;'>
                                    <p style='margin: 0; color: #a94442;'><strong>Sản phẩm loại bỏ:</strong> {productName}</p>
                                    <p style='margin: 5px 0 0 0; color: #a94442;'><strong>Số lượng:</strong> {removedQty} | <strong>Đơn giá:</strong> {removedPrice:N0} đ</p>
                                </div>

                                <p>Dưới đây là chi tiết hóa đơn cập nhật mới của bạn:</p>
                                
                                <h3 style='color: #aa8c2c; border-bottom: 2px solid #f0f0f0; padding-bottom: 8px; margin-top: 25px;'>Chi Tiết Đơn Hàng Cập Nhật</h3>
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
                                        {(remainingDetails.Any() ? itemsHtml : "<tr><td colspan='4' style='padding: 15px; text-align: center; color: #777;'>Không còn sản phẩm nào trong đơn hàng.</td></tr>")}
                                    </tbody>
                                    <tfoot>
                                        <tr style='background-color: #fffaf0;'>
                                            <td colspan='3' style='padding: 12px; border: 1px solid #ddd; text-align: right; font-weight: bold;'>Tổng thanh toán mới:</td>
                                            <td style='padding: 12px; border: 1px solid #ddd; text-align: right; font-weight: bold; color: #d9534f; font-size: 16px;'>{total:N0} đ</td>
                                        </tr>
                                    </tfoot>
                                </table>
                                
                                <div style='margin-top: 30px; border-top: 1px solid #eeeeee; padding-top: 15px; text-align: center; color: #777; font-size: 12px;'>
                                    <p style='margin: 0;'>Chúng tôi xin lỗi vì sự bất tiện này.</p>
                                    <p style='margin: 5px 0 0 0;'>Hotline: 0909.XXX.XXX | Email: support@hiepcms.com</p>
                                </div>
                            </div>
                        </div>";

                    _ = Task.Run(async () => {
                        await _emailService.SendEmailAsync(order.Customer.Email, $"[HiepCMS] Thông báo điều chỉnh đơn hàng #{orderId}", emailBody);
                    });
                }
            }
            catch (Exception)
            {
                // Bỏ qua lỗi gửi email
            }

            return Ok(new { message = "Xóa chi tiết đơn hàng thành công" });
        }
    }
}
