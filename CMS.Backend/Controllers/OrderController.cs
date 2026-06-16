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
        public OrderController(ApplicationDbContext context)
        {
            _context = context;
        }

        public IActionResult Index()
        {
            var list = _context.Orders
                .Include(o => o.Customer)
                .OrderByDescending(o => o.OrderDate)
                .ToList();
            return View(list);
        }

        [HttpPost]
        public IActionResult UpdateStatus(int id, int status)
        {
            var order = _context.Orders.Find(id);
            if (order != null)
            {
                order.Status = status;
                _context.SaveChanges();
                TempData["Success"] = $"Cập nhật trạng thái đơn hàng #{id} thành công!";
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