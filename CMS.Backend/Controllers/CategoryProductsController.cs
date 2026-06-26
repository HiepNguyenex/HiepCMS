using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;

namespace CMS.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CategoryProductsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/categoryproducts
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? search,
            [FromQuery] string? sortBy,
            [FromQuery] bool? isDescending,
            [FromQuery] int? page,
            [FromQuery] int? pageSize)
        {
            var query = _context.CategoryProducts.AsQueryable();

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

        // GET: api/categoryproducts/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var category = await _context.CategoryProducts
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    c.Description
                })
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
            {
                return NotFound(new { message = "Không tìm thấy danh mục sản phẩm" });
            }
            return Ok(category);
        }

        // POST: api/categoryproducts
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CategoryProduct categoryProduct)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.CategoryProducts.Add(categoryProduct);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = categoryProduct.Id }, categoryProduct);
        }

        // PUT: api/categoryproducts/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CategoryProduct categoryProduct)
        {
            if (id != categoryProduct.Id)
            {
                return BadRequest(new { message = "ID không trùng khớp" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.Entry(categoryProduct).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.CategoryProducts.Any(c => c.Id == id))
                {
                    return NotFound(new { message = "Không tìm thấy danh mục sản phẩm để cập nhật" });
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/categoryproducts/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var category = await _context.CategoryProducts.FindAsync(id);
            if (category == null)
            {
                return NotFound(new { message = "Không tìm thấy danh mục sản phẩm" });
            }

            _context.CategoryProducts.Remove(category);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Xóa danh mục sản phẩm thành công" });
        }
    }
}
