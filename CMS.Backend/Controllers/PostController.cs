using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Authorization;

namespace CMS.Backend.Controllers
{
    [Authorize]
    public class PostController : Controller
    {
        private readonly ApplicationDbContext _context;
        public PostController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ───────────── INDEX ─────────────
        public IActionResult Index(int page = 1, int pageSize = 9)
        {
            var query = _context.Posts.Include(p => p.Category);
            int totalItems = query.Count();
            int totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);
            if (totalPages == 0) totalPages = 1;
            if (page < 1) page = 1;
            if (page > totalPages) page = totalPages;

            var posts = query
                .OrderByDescending(p => p.CreatedDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            ViewBag.CurrentPage = page;
            ViewBag.TotalPages = totalPages;
            ViewBag.TotalItems = totalItems;
            return View(posts);
        }

        // ───────────── LIST BY CATEGORY ─────────────
        public IActionResult ListByCategory(int? id, int page = 1, int pageSize = 9)
        {
            if (id == null)
                return BadRequest("Vui lòng cung cấp mã danh mục.");

            var query = _context.Posts
                .Where(p => p.CategoryId == id)
                .Include(p => p.Category);

            int totalItems = query.Count();
            int totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);
            if (totalPages == 0) totalPages = 1;
            if (page < 1) page = 1;
            if (page > totalPages) page = totalPages;

            var posts = query
                .OrderByDescending(p => p.CreatedDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            ViewBag.CategoryName = _context.Categories
                .FirstOrDefault(c => c.Id == id)?.Name ?? "Không rõ";
            ViewBag.CurrentPage = page;
            ViewBag.TotalPages = totalPages;
            ViewBag.TotalItems = totalItems;

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

        // ───────────── CREATE ─────────────
        [HttpGet]
        public IActionResult Create()
        {
            ViewBag.CategoryList = new SelectList(_context.Categories, "Id", "Name");
            return View();
        }

        [HttpPost]
        public IActionResult Create(Post model, IFormFile uploadImage)
        {
            if (!ModelState.IsValid)
            {
                ViewBag.CategoryList = new SelectList(_context.Categories, "Id", "Name", model.CategoryId);
                return View(model);
            }

            if (uploadImage != null && uploadImage.Length > 0)
            {
                string folder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                if (!Directory.Exists(folder)) Directory.CreateDirectory(folder);

                string fileName = Guid.NewGuid().ToString() + Path.GetExtension(uploadImage.FileName);
                string filePath = Path.Combine(folder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                    uploadImage.CopyTo(stream);

                model.ImageUrl = "/uploads/" + fileName;
            }

            model.CreatedDate = DateTime.Now;
            _context.Posts.Add(model);
            _context.SaveChanges();
            return RedirectToAction("Index");
        }

        // ───────────── EDIT ─────────────
        [HttpGet]
        public IActionResult Edit(int id)
        {
            var post = _context.Posts.Find(id);
            if (post == null) return NotFound();

            ViewBag.CategoryList = new SelectList(_context.Categories, "Id", "Name", post.CategoryId);
            return View(post);
        }

        [HttpPost]
        public IActionResult Edit(Post model, IFormFile uploadImage)
        {
            if (!ModelState.IsValid)
            {
                ViewBag.CategoryList = new SelectList(_context.Categories, "Id", "Name", model.CategoryId);
                return View(model);
            }

            if (uploadImage != null && uploadImage.Length > 0)
            {
                string folder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                if (!Directory.Exists(folder)) Directory.CreateDirectory(folder);

                string fileName = Guid.NewGuid().ToString() + Path.GetExtension(uploadImage.FileName);
                string filePath = Path.Combine(folder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                    uploadImage.CopyTo(stream);

                model.ImageUrl = "/uploads/" + fileName;
            }
            else
            {
                var oldPost = _context.Posts.AsNoTracking().FirstOrDefault(p => p.Id == model.Id);
                if (oldPost != null && string.IsNullOrEmpty(model.ImageUrl))
                    model.ImageUrl = oldPost.ImageUrl;
            }

            _context.Posts.Update(model);
            _context.SaveChanges();
            return RedirectToAction("Index");
        }

        // ───────────── UPLOAD IMAGE FROM CKEDITOR ─────────────
        [HttpPost]
        [Authorize]
        public IActionResult UploadImage(IFormFile upload)
        {
            if (upload != null && upload.Length > 0)
            {
                string folder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                if (!Directory.Exists(folder)) Directory.CreateDirectory(folder);

                string fileName = Guid.NewGuid().ToString() + Path.GetExtension(upload.FileName);
                string filePath = Path.Combine(folder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                    upload.CopyTo(stream);

                string url = "/uploads/" + fileName;
                return Json(new { url });
            }
            return BadRequest("Không có file tải lên.");
        }

        // ───────────── DELETE ─────────────
        public IActionResult Delete(int id)
        {
            var post = _context.Posts.Find(id);
            if (post != null)
            {
                _context.Posts.Remove(post);
                _context.SaveChanges();
            }
            return RedirectToAction("Index");
        }
    }
}