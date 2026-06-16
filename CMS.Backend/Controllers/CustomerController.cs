using Microsoft.AspNetCore.Mvc;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using System.Linq;

namespace CMS.Backend.Controllers
{
    [Authorize]
    public class CustomerController : Controller
    {
        private readonly ApplicationDbContext _context;
        public CustomerController(ApplicationDbContext context)
        {
            _context = context;
        }

        // READ
        public IActionResult Index()
        {
            var list = _context.Customers.ToList();
            return View(list);
        }

        // CREATE - GET
        [HttpGet]
        public IActionResult Create()
        {
            return View();
        }

        // CREATE - POST
        [HttpPost]
        public IActionResult Create(Customer model)
        {
            // Kiểm tra trùng lặp Email
            if (_context.Customers.Any(c => c.Email == model.Email))
            {
                ModelState.AddModelError("Email", "Email này đã được đăng ký!");
                return View(model);
            }

            if (ModelState.IsValid)
            {
                _context.Customers.Add(model);
                _context.SaveChanges();
                TempData["Success"] = "Thêm khách hàng thành công!";
                return RedirectToAction("Index");
            }
            return View(model);
        }

        // EDIT - GET
        [HttpGet]
        public IActionResult Edit(int id)
        {
            var customer = _context.Customers.Find(id);
            if (customer == null) return NotFound();
            return View(customer);
        }

        // EDIT - POST
        [HttpPost]
        public IActionResult Edit(Customer model)
        {
            // Kiểm tra trùng lặp Email
            if (_context.Customers.Any(c => c.Email == model.Email && c.Id != model.Id))
            {
                ModelState.AddModelError("Email", "Email này đã được sử dụng bởi khách hàng khác!");
                return View(model);
            }

            if (ModelState.IsValid)
            {
                _context.Customers.Update(model);
                _context.SaveChanges();
                TempData["Success"] = "Cập nhật thông tin khách hàng thành công!";
                return RedirectToAction("Index");
            }
            return View(model);
        }

        // DELETE - POST
        [HttpPost]
        public IActionResult Delete(int id)
        {
            var customer = _context.Customers.Find(id);
            if (customer != null)
            {
                // Kiểm tra xem khách hàng đã có đơn hàng chưa để tránh lỗi khóa ngoại
                var hasOrders = _context.Orders.Any(o => o.CustomerId == id);
                if (hasOrders)
                {
                    TempData["Error"] = "Không thể xóa khách hàng này vì đã có đơn hàng liên kết!";
                    return RedirectToAction("Index");
                }

                _context.Customers.Remove(customer);
                _context.SaveChanges();
                TempData["Success"] = "Xóa khách hàng thành công!";
            }
            return RedirectToAction("Index");
        }
    }
}