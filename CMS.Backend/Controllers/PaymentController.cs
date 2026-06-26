using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;
using Stripe.Checkout;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace CMS.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly Services.IEmailService _emailService;

        public PaymentController(ApplicationDbContext context, Services.IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        [HttpPost("create-checkout-session")]
        public async Task<IActionResult> CreateCheckoutSession([FromBody] CreateSessionRequest request)
        {
            var order = await _context.Orders
                .Include(o => o.OrderDetails!)
                    .ThenInclude(d => d.Product)
                .Include(o => o.Customer)
                .FirstOrDefaultAsync(o => o.Id == request.OrderId);

            if (order == null)
            {
                return NotFound(new { message = "Không tìm thấy đơn hàng" });
            }

            if (order.OrderDetails == null || !order.OrderDetails.Any())
            {
                return BadRequest(new { message = "Đơn hàng không có sản phẩm nào" });
            }

            var lineItems = order.OrderDetails.Select(detail =>
            {
                var productName = detail.Product?.Name ?? $"Sản phẩm #{detail.ProductId}";
                
                // Stripe sử dụng đơn vị tiền tệ nhỏ nhất.
                // Tuy nhiên VND là tiền tệ không có phần thập phân (zero-decimal currency),
                // vì vậy 1 VND = 1 đơn vị trong Stripe (không nhân với 100).
                long unitAmount = (long)detail.UnitPrice;

                return new SessionLineItemOptions
                {
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        UnitAmount = unitAmount,
                        Currency = "vnd",
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = productName,
                            Description = detail.Product?.Description ?? string.Empty,
                        },
                    },
                    Quantity = detail.Quantity,
                };
            }).ToList();

            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = new List<string> { "card" },
                LineItems = lineItems,
                Mode = "payment",
                SuccessUrl = $"http://localhost:3000/checkout-success?session_id={{CHECKOUT_SESSION_ID}}&order_id={order.Id}",
                CancelUrl = "http://localhost:3000/checkout",
                Metadata = new System.Collections.Generic.Dictionary<string, string>
                {
                    { "orderId", order.Id.ToString() },
                    { "customerId", order.CustomerId.ToString() }
                }
            };

            try
            {
                var service = new SessionService();
                Session session = await service.CreateAsync(options);
                return Ok(new { url = session.Url, sessionId = session.Id });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Không thể khởi tạo phiên thanh toán Stripe: " + ex.Message });
            }
        }

        [HttpPost("confirm-payment")]
        public async Task<IActionResult> ConfirmPayment([FromBody] ConfirmPaymentRequest request)
        {
            var order = await _context.Orders
                .Include(o => o.OrderDetails!)
                    .ThenInclude(d => d.Product)
                .Include(o => o.Customer)
                .FirstOrDefaultAsync(o => o.Id == request.OrderId);

            if (order == null)
            {
                return NotFound(new { message = "Không tìm thấy đơn hàng" });
            }

            try
            {
                var service = new SessionService();
                Session session = await service.GetAsync(request.SessionId);

                if (session.PaymentStatus == "paid")
                {
                    // Cập nhật trạng thái đơn hàng:
                    // Chuyển sang 1 (Đang xử lý) vì đã thanh toán online thành công
                    order.Status = 1; 
                    
                    var stripeNotes = $"[Đã thanh toán online qua Stripe. Mã giao dịch: {session.PaymentIntentId}]";
                    if (string.IsNullOrEmpty(order.Notes))
                    {
                        order.Notes = stripeNotes;
                    }
                    else if (!order.Notes.Contains(stripeNotes))
                    {
                        order.Notes += " " + stripeNotes;
                    }

                    await _context.SaveChangesAsync();

                    // Gửi email thông báo thanh toán thành công cho khách hàng
                    if (order.Customer != null && !string.IsNullOrEmpty(order.Customer.Email))
                    {
                        var itemsHtml = "";
                        decimal total = 0;
                        foreach (var item in order.OrderDetails)
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
                                <div style='background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%); color: white; padding: 25px; text-align: center;'>
                                    <h2 style='margin: 0; font-size: 24px; letter-spacing: 1px;'>HIEPCMS PERFUME SHOP</h2>
                                    <p style='margin: 5px 0 0 0; opacity: 0.9;'>Thanh Toán Thành Công qua Stripe</p>
                                </div>
                                <div style='padding: 25px; background-color: #ffffff;'>
                                    <p>Xin chào <strong>{order.Customer.FullName}</strong>,</p>
                                    <p>Chúng tôi đã nhận được khoản thanh toán trực tuyến của bạn cho đơn hàng <strong>#{order.Id}</strong> thông qua cổng thanh toán Stripe. Đơn hàng đang được chuyển sang bộ phận chuẩn bị và giao hàng.</p>
                                    
                                    <div style='background-color: #f9f9f9; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0; border-radius: 4px;'>
                                        <p style='margin: 0 0 8px 0;'><strong>Mã đơn hàng:</strong> #{order.Id}</p>
                                        <p style='margin: 0 0 8px 0;'><strong>Mã giao dịch Stripe:</strong> {session.PaymentIntentId}</p>
                                        <p style='margin: 0 0 8px 0;'><strong>Trạng thái:</strong> <span style='background-color: #28a745; color: white; padding: 3px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;'>Đã thanh toán (Đang xử lý)</span></p>
                                        <p style='margin: 0;'><strong>Địa chỉ giao hàng:</strong> {order.Customer.Address ?? "-"}</p>
                                    </div>
                                    
                                    <h3 style='color: #1e7e34; border-bottom: 2px solid #f0f0f0; padding-bottom: 8px; margin-top: 25px;'>Hóa Đơn Chi Tiết</h3>
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
                                        <p style='margin: 0;'>Cảm ơn quý khách đã mua sắm tại HiepCMS Perfume Shop!</p>
                                        <p style='margin: 5px 0 0 0;'>Hotline: 0909.XXX.XXX | Email: support@hiepcms.com</p>
                                    </div>
                                </div>
                            </div>";

                        _ = Task.Run(async () => {
                            await _emailService.SendEmailAsync(order.Customer.Email, $"[HiepCMS] Thanh toán thành công cho đơn hàng #{order.Id}", emailBody);
                        });
                    }

                    return Ok(new { message = "Thanh toán thành công!", paymentStatus = session.PaymentStatus });
                }
                else
                {
                    return BadRequest(new { message = $"Trạng thái thanh toán của phiên là: {session.PaymentStatus}" });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi xác thực thanh toán: " + ex.Message });
            }
        }
    }

    public class CreateSessionRequest
    {
        public int OrderId { get; set; }
    }

    public class ConfirmPaymentRequest
    {
        public string SessionId { get; set; } = string.Empty;
        public int OrderId { get; set; }
    }
}
