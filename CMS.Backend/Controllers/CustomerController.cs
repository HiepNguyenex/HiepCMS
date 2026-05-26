using Microsoft.AspNetCore.Mvc;
using CMS.Data;

namespace CMS.Backend.Controllers
{
    public class CustomerController : Controller
    {
        private readonly ApplicationDbContext _context;
        public CustomerController(ApplicationDbContext context)
        {
            _context = context;
        }
        public IActionResult Index()
        {
            var list = _context.Customers.ToList();
            return View(list);
        }
    }
}