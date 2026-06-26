using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;

namespace CMS.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PostsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PostsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. GET: api/posts - Lấy toàn bộ danh sách bài viết gọt tỉa
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? search, 
            [FromQuery] int? categoryId,
            [FromQuery] DateTime? minDate,
            [FromQuery] DateTime? maxDate,
            [FromQuery] string? sortBy,
            [FromQuery] bool? isDescending,
            [FromQuery] int? page,
            [FromQuery] int? pageSize)
        {
            var query = _context.Posts.AsQueryable();

            if (categoryId.HasValue)
            {
                query = query.Where(p => p.CategoryId == categoryId.Value);
            }

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(p => p.Title.Contains(search) || p.Content.Contains(search));
            }

            if (minDate.HasValue)
            {
                query = query.Where(p => p.CreatedDate >= minDate.Value);
            }

            if (maxDate.HasValue)
            {
                query = query.Where(p => p.CreatedDate <= maxDate.Value);
            }

            if (!string.IsNullOrEmpty(sortBy))
            {
                switch (sortBy.ToLower())
                {
                    case "createddate":
                        query = isDescending == true ? query.OrderByDescending(p => p.CreatedDate) : query.OrderBy(p => p.CreatedDate);
                        break;
                    case "title":
                        query = isDescending == true ? query.OrderByDescending(p => p.Title) : query.OrderBy(p => p.Title);
                        break;
                    case "id":
                    default:
                        query = isDescending == true ? query.OrderByDescending(p => p.Id) : query.OrderBy(p => p.Id);
                        break;
                }
            }
            else
            {
                query = query.OrderByDescending(p => p.Id);
            }

            if (page.HasValue && pageSize.HasValue && page.Value > 0 && pageSize.Value > 0)
            {
                query = query.Skip((page.Value - 1) * pageSize.Value).Take(pageSize.Value);
            }

            var posts = await query
                .Include(p => p.Category)
                .Select(p => new
                {
                    p.Id,
                    p.Title,
                    p.ImageUrl,
                    p.CreatedDate,
                    p.CategoryId,
                    CategoryName = p.Category != null ? p.Category.Name : null
                })
                .ToListAsync();

            return Ok(posts);
        }

        // 2. GET: api/posts/category/{categoryId} - Lấy bài viết theo danh mục
        [HttpGet("category/{categoryId}")]
        public async Task<IActionResult> GetByCategory(int categoryId)
        {
            var posts = await _context.Posts
                .Include(p => p.Category)
                .Where(p => p.CategoryId == categoryId)
                .OrderByDescending(p => p.CreatedDate)
                .Select(p => new
                {
                    p.Id,
                    p.Title,
                    p.ImageUrl,
                    p.CreatedDate,
                    p.CategoryId,
                    CategoryName = p.Category != null ? p.Category.Name : null
                })
                .ToListAsync();

            return Ok(posts);
        }

        // 3. GET: api/posts/{id} - Lấy chi tiết bài viết đầy đủ
        [HttpGet("{id}")]
        public async Task<IActionResult> GetDetail(int id)
        {
            var post = await _context.Posts
                .Include(p => p.Category)
                .Select(p => new
                {
                    p.Id,
                    p.Title,
                    p.Content,
                    p.ImageUrl,
                    p.CreatedDate,
                    p.CategoryId,
                    CategoryName = p.Category != null ? p.Category.Name : null
                })
                .FirstOrDefaultAsync(p => p.Id == id);

            if (post == null)
            {
                return NotFound(new { message = "Không tìm thấy bài viết này trong hệ thống" });
            }

            return Ok(post);
        }

        // 4. POST: api/posts - Thêm bài viết mới
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Post post)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Kiểm tra danh mục tồn tại
            var categoryExists = await _context.Categories.AnyAsync(c => c.Id == post.CategoryId);
            if (!categoryExists)
            {
                return BadRequest(new { message = "Danh mục bài viết không tồn tại" });
            }

            post.CreatedDate = DateTime.Now;
            _context.Posts.Add(post);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetDetail), new { id = post.Id }, post);
        }

        // 5. PUT: api/posts/{id} - Cập nhật bài viết
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Post post)
        {
            if (id != post.Id)
            {
                return BadRequest(new { message = "ID không trùng khớp" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Kiểm tra danh mục tồn tại
            var categoryExists = await _context.Categories.AnyAsync(c => c.Id == post.CategoryId);
            if (!categoryExists)
            {
                return BadRequest(new { message = "Danh mục bài viết không tồn tại" });
            }

            _context.Entry(post).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Posts.Any(p => p.Id == id))
                {
                    return NotFound(new { message = "Không tìm thấy bài viết để cập nhật" });
                }
                throw;
            }

            return NoContent();
        }

        // 6. DELETE: api/posts/{id} - Xóa bài viết
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var post = await _context.Posts.FindAsync(id);
            if (post == null)
            {
                return NotFound(new { message = "Không tìm thấy bài viết" });
            }

            _context.Posts.Remove(post);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Xóa bài viết thành công" });
        }
    }
}
