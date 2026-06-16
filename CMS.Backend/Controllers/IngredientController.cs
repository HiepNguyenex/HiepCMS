using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using System;
using System.IO;
using System.Linq;

namespace CMS.Backend.Controllers
{
    [Authorize]
    public class IngredientController : Controller
    {
        private readonly ApplicationDbContext _context;

        public IngredientController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ───────────── INDEX ─────────────
        public IActionResult Index()
        {
            var ingredients = _context.Ingredients.ToList();
            return View(ingredients);
        }

        // ───────────── CREATE ─────────────
        [HttpGet]
        public IActionResult Create()
        {
            return View();
        }

        [HttpPost]
        public IActionResult Create(Ingredient model, IFormFile? uploadImage)
        {
            if (uploadImage != null && uploadImage.Length > 0)
            {
                string folder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                if (!Directory.Exists(folder)) Directory.CreateDirectory(folder);

                string fileName = Guid.NewGuid().ToString() + Path.GetExtension(uploadImage.FileName);
                string filePath = Path.Combine(folder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    uploadImage.CopyTo(stream);
                }

                model.ImageUrl = "/uploads/" + fileName;
            }

            if (string.IsNullOrEmpty(model.Title) || string.IsNullOrEmpty(model.Description))
            {
                ModelState.AddModelError("", "Tiêu đề và Mô tả không được để trống.");
                return View(model);
            }

            _context.Ingredients.Add(model);
            _context.SaveChanges();
            return RedirectToAction("Index");
        }

        // ───────────── EDIT ─────────────
        [HttpGet]
        public IActionResult Edit(int id)
        {
            var ingredient = _context.Ingredients.Find(id);
            if (ingredient == null) return NotFound();
            return View(ingredient);
        }

        [HttpPost]
        public IActionResult Edit(Ingredient model, IFormFile? uploadImage)
        {
            if (uploadImage != null && uploadImage.Length > 0)
            {
                string folder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                if (!Directory.Exists(folder)) Directory.CreateDirectory(folder);

                string fileName = Guid.NewGuid().ToString() + Path.GetExtension(uploadImage.FileName);
                string filePath = Path.Combine(folder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    uploadImage.CopyTo(stream);
                }

                model.ImageUrl = "/uploads/" + fileName;
            }
            else
            {
                var old = _context.Ingredients.AsNoTracking().FirstOrDefault(i => i.Id == model.Id);
                if (old != null && string.IsNullOrEmpty(model.ImageUrl))
                {
                    model.ImageUrl = old.ImageUrl;
                }
            }

            if (string.IsNullOrEmpty(model.Title) || string.IsNullOrEmpty(model.Description))
            {
                ModelState.AddModelError("", "Tiêu đề và Mô tả không được để trống.");
                return View(model);
            }

            _context.Ingredients.Update(model);
            _context.SaveChanges();
            return RedirectToAction("Index");
        }

        // ───────────── DELETE ─────────────
        public IActionResult Delete(int id)
        {
            var ingredient = _context.Ingredients.Find(id);
            if (ingredient != null)
            {
                _context.Ingredients.Remove(ingredient);
                _context.SaveChanges();
            }
            return RedirectToAction("Index");
        }
    }
}
