// sinh vien: nguyen vu hiep // mssv: 2123110161
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Security.Claims;
using CMS.Data;
using CMS.Data.Entities;

namespace CMS.Backend.Controllers
{
    public class AccountController : Controller
    {
        private readonly ApplicationDbContext _context;

        public AccountController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult Login()
        {
            if (User.Identity?.IsAuthenticated == true)
            {
                return RedirectToAction("Index", "Home");
            }
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Login(string username, string password)
        {
            if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
            {
                ViewBag.Error = "Tên đăng nhập và mật khẩu không được để trống.";
                return View();
            }

            var user = _context.Users.FirstOrDefault(u => u.Username == username);
            if (user != null)
            {
                var hasher = new Microsoft.AspNetCore.Identity.PasswordHasher<User>();
                var verificationResult = Microsoft.AspNetCore.Identity.PasswordVerificationResult.Failed;
                try
                {
                    verificationResult = hasher.VerifyHashedPassword(user, user.PasswordHash ?? "", password);
                }
                catch (System.FormatException)
                {
                    // Mật khẩu lưu dạng thô (không phải base64 hash), bỏ qua lỗi để kiểm tra trong phần fallback
                }
                
                bool isPasswordValid = false;
                bool shouldUpgradeHash = false;

                if (verificationResult == Microsoft.AspNetCore.Identity.PasswordVerificationResult.Success)
                {
                    isPasswordValid = true;
                }
                else if (user.PasswordHash == password) // Fallback cho tài khoản lưu mật khẩu thô cũ
                {
                    isPasswordValid = true;
                    shouldUpgradeHash = true;
                }

                if (isPasswordValid)
                {
                    if (shouldUpgradeHash)
                    {
                        user.PasswordHash = hasher.HashPassword(user, password);
                        _context.Users.Update(user);
                        _context.SaveChanges();
                    }

                    var claims = new List<Claim>
                    {
                        new Claim(ClaimTypes.Name, user.Username),
                        new Claim(ClaimTypes.Role, user.Role),
                        new Claim("FullName", user.FullName ?? user.Username)
                    };

                    var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                    var authProperties = new AuthenticationProperties
                    {
                        IsPersistent = true,
                        ExpiresUtc = DateTimeOffset.UtcNow.AddMinutes(60)
                    };

                    await HttpContext.SignInAsync(
                        CookieAuthenticationDefaults.AuthenticationScheme,
                        new ClaimsPrincipal(claimsIdentity),
                        authProperties
                    );

                    return RedirectToAction("Index", "Home");
                }
            }

            ViewBag.Error = "Tên đăng nhập hoặc mật khẩu không chính xác.";
            return View();
        }

        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return RedirectToAction("Login");
        }

        public IActionResult AccessDenied()
        {
            return View();
        }
    }
}
