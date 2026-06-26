using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using Microsoft.AspNetCore.Authorization;
using System.Linq;

namespace CMS.Backend.Controllers
{
    [Authorize]
    public class OrderController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly Services.IEmailService _emailService;

        public OrderController(ApplicationDbContext context, Services.IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        public IActionResult Index(int? status)
        {
            var query = _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderDetails) // Thêm để tính tổng tiền ngoài danh sách
                .AsQueryable();

            if (status.HasValue)
            {
                query = query.Where(o => o.Status == status.Value);
                ViewBag.CurrentFilter = status.Value;
            }
            else
            {
                ViewBag.CurrentFilter = -1; // Tất cả
            }

            var list = query.OrderByDescending(o => o.OrderDate).ToList();
            return View(list);
        }

        [HttpPost]
        public IActionResult UpdateStatus(int id, int status)
        {
            var order = _context.Orders
                .Include(o => o.OrderDetails)
                .FirstOrDefault(o => o.Id == id);

            if (order != null)
            {
                int oldStatus = order.Status;

                // Nếu chuyển sang trạng thái Đã hủy (3) và trước đó chưa hủy
                if (status == 3 && oldStatus != 3 && order.OrderDetails != null)
                {
                    foreach (var detail in order.OrderDetails)
                    {
                        var product = _context.Products.Find(detail.ProductId);
                        if (product != null)
                        {
                            product.StockQuantity += detail.Quantity;
                        }
                    }
                }
                // Nếu khôi phục lại từ trạng thái Đã hủy (3) sang trạng thái khác
                else if (oldStatus == 3 && status != 3 && order.OrderDetails != null)
                {
                    foreach (var detail in order.OrderDetails)
                    {
                        var product = _context.Products.Find(detail.ProductId);
                        if (product != null)
                        {
                            if (product.StockQuantity < detail.Quantity)
                            {
                                TempData["Error"] = $"Không thể khôi phục đơn hàng #{id}! Sản phẩm '{product.Name}' không đủ số lượng trong kho.";
                                return RedirectToAction("Index");
                            }
                            product.StockQuantity -= detail.Quantity;
                        }
                    }
                }

                order.Status = status;
                _context.SaveChanges();
                TempData["Success"] = $"Cập nhật trạng thái đơn hàng #{id} thành công!";

                // Gửi email thông báo cập nhật trạng thái đơn hàng cho khách hàng
                try
                {
                    var customer = _context.Customers.Find(order.CustomerId);
                    if (customer != null && !string.IsNullOrEmpty(customer.Email))
                    {
                        string statusText = status switch
                        {
                            0 => "Chờ xác nhận",
                            1 => "Đang xử lý",
                            2 => "Đã giao",
                            3 => "Đã hủy",
                            _ => "Không rõ"
                        };

                        string statusBadgeColor = status switch
                        {
                            0 => "#6c757d", // Gray
                            1 => "#ffc107", // Yellow
                            2 => "#28a745", // Green
                            3 => "#dc3545", // Red
                            _ => "#777777"
                        };

                        var itemsHtml = "";
                        decimal total = 0;
                        var details = _context.OrderDetails
                            .Include(d => d.Product)
                            .Where(d => d.OrderId == order.Id)
                            .ToList();

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
                                    <p style='margin: 5px 0 0 0; opacity: 0.9;'>Cập Nhật Trạng Thái Đơn Hàng</p>
                                </div>
                                <div style='padding: 25px; background-color: #ffffff;'>
                                    <p>Xin chào <strong>{customer.FullName}</strong>,</p>
                                    <p>Chúng tôi xin thông báo trạng thái đơn hàng <strong>#{order.Id}</strong> của bạn đã được thay đổi.</p>
                                    
                                    <div style='background-color: #f9f9f9; padding: 15px; border-left: 4px solid #d4af37; margin: 20px 0; border-radius: 4px;'>
                                        <p style='margin: 0 0 8px 0;'><strong>Mã đơn hàng:</strong> #{order.Id}</p>
                                        <p style='margin: 0 0 8px 0;'><strong>Trạng thái mới:</strong> <span style='background-color: {statusBadgeColor}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;'>{statusText}</span></p>
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
                                        <p style='margin: 0;'>Cảm ơn quý khách đã đồng hành cùng HiepCMS Perfume Shop!</p>
                                        <p style='margin: 5px 0 0 0;'>Hotline: 0909.XXX.XXX | Email: support@hiepcms.com</p>
                                    </div>
                                </div>
                            </div>";

                        _ = Task.Run(async () => {
                            await _emailService.SendEmailAsync(customer.Email, $"[HiepCMS] Cập nhật đơn hàng #{order.Id} - Trạng thái: {statusText}", emailBody);
                        });
                    }
                }
                catch (Exception)
                {
                    // Bỏ qua lỗi gửi mail để không ảnh hưởng luồng chính
                }
            }
            else
            {
                TempData["Error"] = "Không tìm thấy đơn hàng!";
            }
            return RedirectToAction("Index");
        }

        [HttpPost]
        public IActionResult Delete(int id)
        {
            var order = _context.Orders
                .Include(o => o.OrderDetails)
                .FirstOrDefault(o => o.Id == id);

            if (order != null)
            {
                // Hoàn lại kho cho các sản phẩm trong đơn hàng bị xóa (nếu đơn chưa hoàn thành)
                if (order.Status != 2 && order.OrderDetails != null)
                {
                    foreach (var detail in order.OrderDetails)
                    {
                        var product = _context.Products.Find(detail.ProductId);
                        if (product != null)
                        {
                            product.StockQuantity += detail.Quantity;
                        }
                    }
                }

                _context.Orders.Remove(order);
                _context.SaveChanges();
                TempData["Success"] = $"Xóa đơn hàng #{id} thành công!";
            }
            else
            {
                TempData["Error"] = "Không tìm thấy đơn hàng!";
            }
            return RedirectToAction("Index");
        }
    }
}