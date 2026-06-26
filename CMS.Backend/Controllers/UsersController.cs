using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Identity;

namespace CMS.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/users
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? search,
            [FromQuery] string? role,
            [FromQuery] string? sortBy,
            [FromQuery] bool? isDescending,
            [FromQuery] int? page,
            [FromQuery] int? pageSize)
        {
            var query = _context.Users.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(u => u.Username.Contains(search) || (u.FullName != null && u.FullName.Contains(search)));
            }

            if (!string.IsNullOrEmpty(role))
            {
                query = query.Where(u => u.Role == role);
            }

            if (!string.IsNullOrEmpty(sortBy))
            {
                switch (sortBy.ToLower())
                {
                    case "username":
                        query = isDescending == true ? query.OrderByDescending(u => u.Username) : query.OrderBy(u => u.Username);
                        break;
                    case "fullname":
                        query = isDescending == true ? query.OrderByDescending(u => u.FullName) : query.OrderBy(u => u.FullName);
                        break;
                    case "id":
                    default:
                        query = isDescending == true ? query.OrderByDescending(u => u.Id) : query.OrderBy(u => u.Id);
                        break;
                }
            }
            else
            {
                query = query.OrderBy(u => u.Id);
            }

            if (page.HasValue && pageSize.HasValue && page.Value > 0 && pageSize.Value > 0)
            {
                query = query.Skip((page.Value - 1) * pageSize.Value).Take(pageSize.Value);
            }

            var list = await query
                .Select(u => new
                {
                    u.Id,
                    u.Username,
                    u.FullName,
                    u.Role
                })
                .ToListAsync();
            return Ok(list);
        }

        // GET: api/users/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var user = await _context.Users
                .Select(u => new
                {
                    u.Id,
                    u.Username,
                    u.FullName,
                    u.Role
                })
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound(new { message = "Không tìm thấy người dùng" });
            }
            return Ok(user);
        }

        // POST: api/users
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] User user)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Kiểm tra username trùng lặp
            var userExists = await _context.Users.AnyAsync(u => u.Username == user.Username);
            if (userExists)
            {
                return BadRequest(new { message = "Tên đăng nhập này đã được sử dụng" });
            }

            // Băm mật khẩu bằng PasswordHasher
            if (!string.IsNullOrEmpty(user.PasswordHash))
            {
                var hasher = new PasswordHasher<User>();
                user.PasswordHash = hasher.HashPassword(user, user.PasswordHash);
            }

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Ẩn mật khẩu khi trả về
            var result = new
            {
                user.Id,
                user.Username,
                user.FullName,
                user.Role
            };

            return CreatedAtAction(nameof(GetById), new { id = user.Id }, result);
        }

        // PUT: api/users/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] User user)
        {
            if (id != user.Id)
            {
                return BadRequest(new { message = "ID không trùng khớp" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Kiểm tra trùng lặp username
            var userExists = await _context.Users.AnyAsync(u => u.Username == user.Username && u.Id != id);
            if (userExists)
            {
                return BadRequest(new { message = "Tên đăng nhập này đã được sử dụng bởi người dùng khác" });
            }

            // Tìm thực thể cũ trong db để lấy lại mật khẩu cũ nếu không đổi mật khẩu
            var existingUser = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id);
            if (existingUser == null)
            {
                return NotFound(new { message = "Không tìm thấy người dùng để cập nhật" });
            }

            // Nếu mật khẩu mới truyền lên rỗng, dùng lại mật khẩu đã băm cũ. Ngược lại thì băm mật khẩu mới.
            if (string.IsNullOrEmpty(user.PasswordHash))
            {
                user.PasswordHash = existingUser.PasswordHash;
            }
            else
            {
                var hasher = new PasswordHasher<User>();
                user.PasswordHash = hasher.HashPassword(user, user.PasswordHash);
            }

            _context.Entry(user).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Users.Any(u => u.Id == id))
                {
                    return NotFound(new { message = "Không tìm thấy người dùng để cập nhật" });
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/users/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "Không tìm thấy người dùng" });
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Xóa người dùng thành công" });
        }
    }
}
