using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Authorization;

namespace CMS.Backend.Controllers
{
    [Authorize]
    public class ProductController : Controller
    {
        private readonly ApplicationDbContext _context;
        public ProductController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ───────────── INDEX ─────────────
        public IActionResult Index()
        {
            var products = _context.Products
                .Include(p => p.CategoryProduct)
                .ToList();
            return View(products);
        }

        // ───────────── CREATE ─────────────
        [HttpGet]
        public IActionResult Create()
        {
            ViewBag.CategoryProductList = new SelectList(
                _context.CategoryProducts, "Id", "Name");
            return View();
        }

        [HttpPost]
        public IActionResult Create(Product model, IFormFile uploadImage)
        {
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

            _context.Products.Add(model);
            _context.SaveChanges();
            return RedirectToAction("Index");
        }

        // ───────────── EDIT ─────────────
        [HttpGet]
        public IActionResult Edit(int id)
        {
            var product = _context.Products.Find(id);
            if (product == null) return NotFound();

            ViewBag.CategoryProductList = new SelectList(
                _context.CategoryProducts, "Id", "Name", product.CategoryProductId);
            return View(product);
        }

        [HttpPost]
        public IActionResult Edit(Product model, IFormFile uploadImage)
        {
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
                var old = _context.Products.AsNoTracking()
                          .FirstOrDefault(p => p.Id == model.Id);
                if (old != null && string.IsNullOrEmpty(model.ImageUrl))
                    model.ImageUrl = old.ImageUrl;
            }

            _context.Products.Update(model);
            _context.SaveChanges();
            return RedirectToAction("Index");
        }

        // ───────────── DELETE ─────────────
        public IActionResult Delete(int id)
        {
            var product = _context.Products.Find(id);
            if (product != null)
            {
                _context.Products.Remove(product);
                _context.SaveChanges();
            }
            return RedirectToAction("Index");
        }
    }
}