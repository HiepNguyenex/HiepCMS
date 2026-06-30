// sinh vien: nguyen vu hiep // mssv: 2123110161
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using CMS.Backend.Services;

namespace CMS.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;
        private readonly IEmailService _emailService;

        public AuthController(ApplicationDbContext context, IConfiguration config, IEmailService emailService)
        {
            _context = context;
            _config = config;
            _emailService = emailService;
        }

        // POST: api/auth/login (Dành cho Admin / Staff đăng nhập trên Swagger / API)
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] AdminLoginRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
            if (user == null)
            {
                return BadRequest(new { message = "Tên đăng nhập hoặc mật khẩu không chính xác." });
            }

            var hasher = new PasswordHasher<User>();
            var verificationResult = PasswordVerificationResult.Failed;
            try
            {
                verificationResult = hasher.VerifyHashedPassword(user, user.PasswordHash ?? "", request.Password);
            }
            catch (System.FormatException)
            {
                // Fallback nếu lưu mật khẩu dạng thô
            }

            bool isPasswordValid = false;
            if (verificationResult == PasswordVerificationResult.Success)
            {
                isPasswordValid = true;
            }
            else if (user.PasswordHash == request.Password)
            {
                isPasswordValid = true;
                // Nâng cấp lên băm mật khẩu
                user.PasswordHash = hasher.HashPassword(user, request.Password);
                _context.Users.Update(user);
                await _context.SaveChangesAsync();
            }

            if (!isPasswordValid)
            {
                return BadRequest(new { message = "Tên đăng nhập hoặc mật khẩu không chính xác." });
            }

            // Sinh JWT Token
            var token = GenerateJwtToken(user.Id.ToString(), user.Username, user.Role, user.FullName ?? user.Username);

            return Ok(new
            {
                token,
                user = new
                {
                    user.Id,
                    user.Username,
                    user.FullName,
                    user.Role
                }
            });
        }

        // POST: api/auth/customer-login (Dành cho Khách hàng đăng nhập trên React / API)
        [HttpPost("customer-login")]
        public async Task<IActionResult> CustomerLogin([FromBody] CustomerLoginRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Email == request.Email);
            if (customer == null)
            {
                return BadRequest(new { message = "Email hoặc mật khẩu không chính xác." });
            }

            var hasher = new PasswordHasher<Customer>();
            var verificationResult = PasswordVerificationResult.Failed;
            try
            {
                verificationResult = hasher.VerifyHashedPassword(customer, customer.Password ?? "", request.Password);
            }
            catch (System.FormatException)
            {
                // Fallback nếu lưu mật khẩu dạng thô
            }

            bool isPasswordValid = false;
            bool shouldUpgradeHash = false;

            if (verificationResult == PasswordVerificationResult.Success)
            {
                isPasswordValid = true;
            }
            else if (customer.Password == request.Password) // Fallback cho tài khoản cũ lưu mật khẩu thô
            {
                isPasswordValid = true;
                shouldUpgradeHash = true;
            }

            if (!isPasswordValid)
            {
                return BadRequest(new { message = "Email hoặc mật khẩu không chính xác." });
            }

            if (shouldUpgradeHash)
            {
                // Tự động nâng cấp mật khẩu khách hàng sang dạng băm
                customer.Password = hasher.HashPassword(customer, request.Password);
                _context.Customers.Update(customer);
                await _context.SaveChangesAsync();
            }

            // Sinh JWT Token cho Khách hàng
            var token = GenerateJwtToken(customer.Id.ToString(), customer.Email, "Customer", customer.FullName);

            return Ok(new
            {
                token,
                customer = new
                {
                    customer.Id,
                    customer.FullName,
                    customer.Email,
                    customer.Phone,
                    customer.Address
                }
            });
        }

        private string GenerateJwtToken(string id, string uniqueName, string role, string fullName)
        {
            var keyStr = _config["Jwt:Key"] ?? "HiepCMS_Super_Secret_Key_For_Jwt_Token_Authentication_2026";
            var issuer = _config["Jwt:Issuer"] ?? "HiepCMS_Backend";
            var audience = _config["Jwt:Audience"] ?? "HiepCMS_Frontend";
            var durationMin = Convert.ToInt32(_config["Jwt:DurationInMinutes"] ?? "180");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyStr));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, id),
                new Claim(JwtRegisteredClaimNames.UniqueName, uniqueName),
                new Claim(ClaimTypes.Role, role),
                new Claim("FullName", fullName),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(durationMin),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // POST: api/auth/forgot-password
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Email == request.Email);
            if (customer == null)
            {
                return BadRequest(new { message = "Email không tồn tại trong hệ thống." });
            }

            // Sinh mật khẩu ngẫu nhiên 6 chữ số
            var random = new Random();
            var newPassword = random.Next(100000, 999999).ToString();

            // Băm mật khẩu mới và lưu vào cơ sở dữ liệu
            var hasher = new PasswordHasher<Customer>();
            customer.Password = hasher.HashPassword(customer, newPassword);

            _context.Customers.Update(customer);
            await _context.SaveChangesAsync();

            // Gửi email chứa mật khẩu mới
            var subject = "Khôi phục mật khẩu tài khoản HiepCMS";
            var body = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>
                    <h2 style='color: #1c1e21; text-align: center; border-bottom: 2px solid #f5f5f5; padding-bottom: 10px;'>Khôi Phục Mật Khẩu Thành Công</h2>
                    <p>Chào <b>{customer.FullName}</b>,</p>
                    <p>Hệ thống đã thiết lập lại mật khẩu mới cho tài khoản của bạn tại <b>HiepCMS Perfume Shop</b>.</p>
                    <div style='background-color: #f9f9f9; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;'>
                        <p style='margin: 0; font-size: 14px; color: #666;'>Mật khẩu đăng nhập mới của bạn là:</p>
                        <p style='margin: 10px 0 0 0; font-size: 24px; color: #d9534f; font-weight: bold; letter-spacing: 2px;'>{newPassword}</p>
                    </div>
                    <p style='color: #d9534f; font-size: 13px;'>* Lưu ý: Hãy đăng nhập ngay và thay đổi mật khẩu tại trang cá nhân để bảo mật thông tin.</p>
                    <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;' />
                    <p style='font-size: 12px; color: #999; text-align: center;'>Đây là email tự động từ hệ thống HiepCMS, vui lòng không trả lời thư này.</p>
                </div>
            ";

            await _emailService.SendEmailAsync(customer.Email, subject, body);

            return Ok(new { message = "Mật khẩu mới đã được gửi tới email của bạn." });
        }
    }

    public class AdminLoginRequest
    {
        [Required(ErrorMessage = "Username không được để trống")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mật khẩu không được để trống")]
        public string Password { get; set; } = string.Empty;
    }

    public class ForgotPasswordRequest
    {
        [Required(ErrorMessage = "Email không được để trống")]
        [EmailAddress(ErrorMessage = "Định dạng email không hợp lệ")]
        public string Email { get; set; } = string.Empty;
    }
}
