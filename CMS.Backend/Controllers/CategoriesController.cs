using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;

namespace CMS.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CategoriesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/categories
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? search,
            [FromQuery] string? sortBy,
            [FromQuery] bool? isDescending,
            [FromQuery] int? page,
            [FromQuery] int? pageSize)
        {
            var query = _context.Categories.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(c => c.Name.Contains(search) || (c.Description != null && c.Description.Contains(search)));
            }

            if (!string.IsNullOrEmpty(sortBy))
            {
                switch (sortBy.ToLower())
                {
                    case "name":
                        query = isDescending == true ? query.OrderByDescending(c => c.Name) : query.OrderBy(c => c.Name);
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
                    c.Name,
                    c.Description
                })
                .ToListAsync();
            return Ok(list);
        }

        // GET: api/categories/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var category = await _context.Categories
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    c.Description
                })
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
            {
                return NotFound(new { message = "Không tìm thấy danh mục" });
            }
            return Ok(category);
        }

        // POST: api/categories
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Category category)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = category.Id }, category);
        }

        // PUT: api/categories/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Category category)
        {
            if (id != category.Id)
            {
                return BadRequest(new { message = "ID không trùng khớp" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.Entry(category).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Categories.Any(c => c.Id == id))
                {
                    return NotFound(new { message = "Không tìm thấy danh mục để cập nhật" });
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/categories/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                return NotFound(new { message = "Không tìm thấy danh mục" });
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Xóa danh mục thành công" });
        }
    }
}
