using CMS.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

public class HomeController : Controller
{
    private readonly ApplicationDbContext _context;

    public HomeController(ApplicationDbContext context)
    {
        _context = context;
    }

    public class RecentOrderDto
    {
        public int Id { get; set; }
        public DateTime OrderDate { get; set; }
        public string CustomerName { get; set; } = "";
        public int Status { get; set; }
        public decimal TotalAmount { get; set; }
    }

    public IActionResult Index()
    {
        // 1. Thống kê tổng quan
        ViewBag.TotalProducts = _context.Products.Count();
        ViewBag.TotalCustomers = _context.Customers.Count();
        ViewBag.TotalOrders = _context.Orders.Count();
        ViewBag.TotalRevenue = _context.OrderDetails.Any() ? _context.OrderDetails.Sum(d => d.Quantity * d.UnitPrice) : 0;

        // 2. Lấy 5 đơn hàng gần đây nhất
        ViewBag.RecentOrders = _context.Orders
            .Include(o => o.Customer)
            .Include(o => o.OrderDetails)
            .OrderByDescending(o => o.OrderDate)
            .Take(5)
            .Select(o => new RecentOrderDto
            {
                Id = o.Id,
                OrderDate = o.OrderDate,
                CustomerName = o.Customer != null ? o.Customer.FullName : "Khách vãng lai",
                Status = o.Status,
                TotalAmount = o.OrderDetails != null ? o.OrderDetails.Sum(d => d.Quantity * d.UnitPrice) : 0
            })
            .ToList();

        // 3. Lấy 3 bài viết mới nhất
        var latestPosts = _context.Posts
                          .Include(p => p.Category)
                          .OrderByDescending(p => p.CreatedDate)
                          .Take(3)
                          .ToList();

        return View(latestPosts);
    }
}