using Microsoft.AspNetCore.Mvc;
using CMS.Data;
using CMS.Data.Entities;

namespace CMS.Backend.Controllers
{
    public class CategoryController : Controller
    {
        private readonly ApplicationDbContext _context;
        public CategoryController(ApplicationDbContext context)
        {
            _context = context;
        }

        // READ
        public IActionResult Index()
        {
            var list = _context.Categories.ToList();
            return View(list);
        }

        // CREATE - GET
        public IActionResult Create() => View();

        // CREATE - POST
        [HttpPost]
        public IActionResult Create(Category model)
        {
            if (ModelState.IsValid)
            {
                _context.Categories.Add(model);
                _context.SaveChanges();
                return RedirectToAction("Index");
            }
            return View(model);
        }

        // EDIT - GET
        public IActionResult Edit(int id)
        {
            var cat = _context.Categories.Find(id);
            if (cat == null) return NotFound();
            return View(cat);
        }

        // EDIT - POST
        [HttpPost]
        public IActionResult Edit(Category model)
        {
            if (ModelState.IsValid)
            {
                _context.Categories.Update(model);
                _context.SaveChanges();
                return RedirectToAction("Index");
            }
            return View(model);
        }

        // DELETE - POST
        [HttpPost]
        public IActionResult Delete(int id)
        {
            var cat = _context.Categories.Find(id);
            if (cat != null)
            {
                _context.Categories.Remove(cat);
                _context.SaveChanges();
            }
            return RedirectToAction("Index");
        }
    }
}