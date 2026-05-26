using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;

namespace CMS.Backend.Controllers
{
    public class UserController : Controller
    {
        private readonly ApplicationDbContext _context;
        public UserController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ───────────── INDEX ─────────────
        public IActionResult Index()
        {
            var users = _context.Users.ToList();
            return View(users);
        }

        // ───────────── CREATE ─────────────
        [HttpGet]
        public IActionResult Create()
        {
            return View();
        }

        [HttpPost]
        public IActionResult Create(User model)
        {
            // Kiểm tra tên đăng nhập đã tồn tại chưa
            var checkExist = _context.Users.Any(u => u.Username == model.Username);
            if (checkExist)
            {
                ModelState.AddModelError("Username", "Tên đăng nhập này đã có người dùng!");
                return View(model);
            }

            _context.Users.Add(model);
            _context.SaveChanges();
            return RedirectToAction("Index");
        }

        // ───────────── EDIT ─────────────
        [HttpGet]
        public IActionResult Edit(int id)
        {
            var user = _context.Users.Find(id);
            if (user == null) return NotFound();
            return View(user);
        }

        [HttpPost]
        public IActionResult Edit(User model, string NewPassword)
        {
            // Lấy user gốc để giữ mật khẩu cũ nếu không đổi
            var existingUser = _context.Users.AsNoTracking()
                               .FirstOrDefault(u => u.Id == model.Id);

            if (existingUser == null) return NotFound();

            // Nếu nhập mật khẩu mới thì dùng mới, không thì giữ cũ
            if (!string.IsNullOrEmpty(NewPassword))
                model.PasswordHash = NewPassword;
            else
                model.PasswordHash = existingUser.PasswordHash;

            _context.Users.Update(model);
            _context.SaveChanges();
            return RedirectToAction("Index");
        }

        // ───────────── DELETE ─────────────
        public IActionResult Delete(int id)
        {
            var user = _context.Users.Find(id);
            if (user != null)
            {
                _context.Users.Remove(user);
                _context.SaveChanges();
            }
            return RedirectToAction("Index");
        }
    }
}