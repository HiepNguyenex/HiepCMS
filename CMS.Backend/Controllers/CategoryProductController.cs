using Microsoft.AspNetCore.Mvc;
using CMS.Data;
using CMS.Data.Entities;

namespace CMS.Backend.Controllers
{
    public class CategoryProductController : Controller
    {
        private readonly ApplicationDbContext _context;

        public CategoryProductController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Danh sách
        public IActionResult Index()
        {
            var list = _context.CategoryProducts.ToList();
            return View(list);
        }

        // Thêm mới - GET
        public IActionResult Create()
        {
            return View();
        }

        // Thêm mới - POST
        [HttpPost]
        public IActionResult Create(CategoryProduct model)
        {
            if (_context.CategoryProducts.Any(c => c.Name == model.Name))
            {
                ModelState.AddModelError("Name", "Tên danh mục này đã tồn tại!");
                return View(model);
            }
            _context.CategoryProducts.Add(model);
            _context.SaveChanges();
            TempData["Success"] = "Thêm danh mục sản phẩm thành công!";
            return RedirectToAction("Index");
        }

        // Sửa - GET
        public IActionResult Edit(int id)
        {
            var item = _context.CategoryProducts.Find(id);
            if (item == null) return NotFound();
            return View(item);
        }

        // Sửa - POST
        [HttpPost]
        public IActionResult Edit(CategoryProduct model)
        {
            var item = _context.CategoryProducts.Find(model.Id);
            if (item == null) return NotFound();
            item.Name = model.Name;
            item.Description = model.Description;
            _context.SaveChanges();
            TempData["Success"] = "Cập nhật thành công!";
            return RedirectToAction("Index");
        }

        // Xóa - POST
        [HttpPost]
        public IActionResult Delete(int id)
        {
            var item = _context.CategoryProducts.Find(id);
            if (item == null) return NotFound();
            _context.CategoryProducts.Remove(item);
            _context.SaveChanges();
            TempData["Success"] = "Xóa thành công!";
            return RedirectToAction("Index");
        }
    }
}