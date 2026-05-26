using Microsoft.AspNetCore.Mvc;
using CMS.Data;

namespace CMS.Backend.Controllers
{
    public class OrderDetailController : Controller
    {
        private readonly ApplicationDbContext _context;
        public OrderDetailController(ApplicationDbContext context)
        {
            _context = context;
        }
        public IActionResult Index()
        {
            var list = _context.OrderDetails.ToList();
            return View(list);
        }
    }
}