using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;

namespace CMS.Backend.Controllers
{
    public class PostController : Controller
    {
        private readonly ApplicationDbContext _context;
        public PostController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ───────────── INDEX ─────────────
        public IActionResult Index()
        {
            var posts = _context.Posts
                .Include(p => p.Category)
                .OrderByDescending(p => p.CreatedDate)
                .ToList();
            return View(posts);
        }

        // ───────────── LIST BY CATEGORY ─────────────
        public IActionResult ListByCategory(int? id)
        {
            if (id == null)
                return BadRequest("Vui lòng cung cấp mã danh mục.");

            var posts = _context.Posts
                .Where(p => p.CategoryId == id)
                .OrderByDescending(p => p.CreatedDate)
                .Include(p => p.Category)
                .ToList();

            ViewBag.CategoryName = _context.Categories
                .FirstOrDefault(c => c.Id == id)?.Name ?? "Không rõ";

            return View("Index", posts);
        }

        // ───────────── DETAILS ─────────────
        public IActionResult Details(int id)
        {
            var post = _context.Posts
                .Include(p => p.Category)
                .FirstOrDefault(p => p.Id == id);

            if (post == null) return NotFound();
            return View(post);
        }
    }
}