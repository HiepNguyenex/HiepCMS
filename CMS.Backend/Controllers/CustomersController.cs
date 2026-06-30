using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace CMS.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CustomersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/customers
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? search,
            [FromQuery] string? sortBy,
            [FromQuery] bool? isDescending,
            [FromQuery] int? page,
            [FromQuery] int? pageSize)
        {
            var query = _context.Customers.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(c => c.FullName.Contains(search) || 
                                         c.Email.Contains(search) || 
                                         (c.Phone != null && c.Phone.Contains(search)) || 
                                         (c.Address != null && c.Address.Contains(search)));
            }

            if (!string.IsNullOrEmpty(sortBy))
            {
                switch (sortBy.ToLower())
                {
                    case "fullname":
                        query = isDescending == true ? query.OrderByDescending(c => c.FullName) : query.OrderBy(c => c.FullName);
                        break;
                    case "email":
                        query = isDescending == true ? query.OrderByDescending(c => c.Email) : query.OrderBy(c => c.Email);
                        break;
                    case "id":
                    default:
                        query = isDescending == true ? query.OrderByDescending(c => c.Id) : query.OrderBy(c => c.Id);
                        break;
                }
            }
            else
            {
                query = query.OrderBy(c => c.Id);
            }

            if (page.HasValue && pageSize.HasValue && page.Value > 0 && pageSize.Value > 0)
            {
                query = query.Skip((page.Value - 1) * pageSize.Value).Take(pageSize.Value);
            }

            var list = await query
                .Select(c => new
                {
                    c.Id,
                    c.FullName,
                    c.Email,
                    c.Phone,
                    c.Address
                })
                .ToListAsync();
            return Ok(list);
        }

        // GET: api/customers/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var customer = await _context.Customers
                .Select(c => new
                {
                    c.Id,
                    c.FullName,
                    c.Email,
                    c.Phone,
                    c.Address
                })
                .FirstOrDefaultAsync(c => c.Id == id);

            if (customer == null)
            {
                return NotFound(new { message = "Không tìm thấy khách hàng" });
            }
            return Ok(customer);
        }

        // POST: api/customers
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Customer customer)
        {
            if (string.IsNullOrEmpty(customer.Password))
            {
                ModelState.AddModelError("Password", "Mật khẩu là bắt buộc khi đăng ký.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Kiểm tra email trùng lặp
            var emailExists = await _context.Customers.AnyAsync(c => c.Email == customer.Email);
            if (emailExists)
            {
                return BadRequest(new { message = "Email này đã được đăng ký trong hệ thống" });
            }

            // Băm mật khẩu khách hàng bằng PasswordHasher
            var hasher = new PasswordHasher<Customer>();
            customer.Password = hasher.HashPassword(customer, customer.Password);

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            // Ẩn mật khẩu khi trả về
            var result = new
            {
                customer.Id,
                customer.FullName,
                customer.Email,
                customer.Phone,
                customer.Address
            };

            return CreatedAtAction(nameof(GetById), new { id = customer.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Customer customer)
        {
            Console.WriteLine($"[DEBUG PUT] id={id}, customer.Id={customer.Id}, customer.FullName={customer.FullName ?? "null"}, customer.Email={customer.Email ?? "null"}, customer.Password={customer.Password ?? "null"}");

            if (id != customer.Id)
            {
                Console.WriteLine($"[DEBUG PUT] ID mismatch: url_id={id}, body_id={customer.Id}");
                return BadRequest(new { message = "ID không trùng khớp" });
            }

            // Tìm thực thể cũ để giữ mật khẩu nếu password trong body bị rỗng/null
            var existingCustomer = await _context.Customers.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id);
            if (existingCustomer == null)
            {
                return NotFound(new { message = "Không tìm thấy khách hàng để cập nhật" });
            }

            if (string.IsNullOrEmpty(customer.Password))
            {
                customer.Password = existingCustomer.Password;
                ModelState.Remove("Password");
            }
            else if (customer.Password != existingCustomer.Password)
            {
                // Mật khẩu mới được nhập -> băm mật khẩu
                var hasher = new PasswordHasher<Customer>();
                customer.Password = hasher.HashPassword(customer, customer.Password);
            }

            if (!ModelState.IsValid)
            {
                var errors = string.Join("; ", ModelState.Values
                    .SelectMany(x => x.Errors)
                    .Select(x => x.ErrorMessage));
                Console.WriteLine("VALIDATION ERRORS: " + errors);
                return BadRequest(ModelState);
            }

            // Kiểm tra trùng lặp email với khách hàng khác
            var emailExists = await _context.Customers.AnyAsync(c => c.Email == customer.Email && c.Id != id);
            if (emailExists)
            {
                return BadRequest(new { message = "Email này đã được sử dụng bởi khách hàng khác" });
            }

            _context.Entry(customer).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Customers.Any(c => c.Id == id))
                {
                    return NotFound(new { message = "Không tìm thấy khách hàng để cập nhật" });
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/customers/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null)
            {
                return NotFound(new { message = "Không tìm thấy khách hàng" });
            }

            _context.Customers.Remove(customer);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Xóa khách hàng thành công" });
        }

        // POST: api/customers/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] CustomerLoginRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var customer = await _context.Customers
                .FirstOrDefaultAsync(c => c.Email == request.Email);

            if (customer == null)
            {
                return BadRequest(new { message = "Email hoặc mật khẩu không chính xác." });
            }

            // Xác thực mật khẩu bằng PasswordHasher
            var hasher = new PasswordHasher<Customer>();
            var verificationResult = hasher.VerifyHashedPassword(customer, customer.Password ?? "", request.Password);

            if (verificationResult == PasswordVerificationResult.Failed)
            {
                return BadRequest(new { message = "Email hoặc mật khẩu không chính xác." });
            }

            // Nếu hash cũ (SuccessRehashNeeded), cập nhật hash mới
            if (verificationResult == PasswordVerificationResult.SuccessRehashNeeded)
            {
                customer.Password = hasher.HashPassword(customer, request.Password);
                _context.Customers.Update(customer);
                await _context.SaveChangesAsync();
            }

            var result = new
            {
                customer.Id,
                customer.FullName,
                customer.Email,
                customer.Phone,
                customer.Address
            };

            return Ok(result);
        }
    }

    public class CustomerLoginRequest
    {
        [Required]
        public string Email { get; set; }
        [Required]
        public string Password { get; set; }
    }
}
