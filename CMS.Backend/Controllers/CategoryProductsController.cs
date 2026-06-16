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
        public async Task<IActionResult> GetAll()
        {
            var list = await _context.CategoryProducts
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
