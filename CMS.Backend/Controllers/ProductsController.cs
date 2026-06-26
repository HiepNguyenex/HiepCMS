using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;

namespace CMS.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/products
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? search, 
            [FromQuery] int? categoryId,
            [FromQuery] decimal? minPrice,
            [FromQuery] decimal? maxPrice,
            [FromQuery] bool? inStockOnly,
            [FromQuery] string? sortBy,
            [FromQuery] bool? isDescending,
            [FromQuery] int? page,
            [FromQuery] int? pageSize)
        {
            var query = _context.Products.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(p => p.Name.Contains(search) || (p.Description != null && p.Description.Contains(search)));
            }

            if (categoryId.HasValue)
            {
                query = query.Where(p => p.CategoryProductId == categoryId.Value);
            }

            if (minPrice.HasValue)
            {
                query = query.Where(p => p.Price >= minPrice.Value);
            }

            if (maxPrice.HasValue)
            {
                query = query.Where(p => p.Price <= maxPrice.Value);
            }

            if (inStockOnly == true)
            {
                query = query.Where(p => p.StockQuantity > 0);
            }

            if (!string.IsNullOrEmpty(sortBy))
            {
                switch (sortBy.ToLower())
                {
                    case "name":
                        query = isDescending == true ? query.OrderByDescending(p => p.Name) : query.OrderBy(p => p.Name);
                        break;
                    case "price":
                        query = isDescending == true ? query.OrderByDescending(p => p.Price) : query.OrderBy(p => p.Price);
                        break;
                    case "stockquantity":
                        query = isDescending == true ? query.OrderByDescending(p => p.StockQuantity) : query.OrderBy(p => p.StockQuantity);
                        break;
                    case "id":
                    default:
                        query = isDescending == true ? query.OrderByDescending(p => p.Id) : query.OrderBy(p => p.Id);
                        break;
                }
            }
            else
            {
                query = query.OrderBy(p => p.Id);
            }

            if (page.HasValue && pageSize.HasValue && page.Value > 0 && pageSize.Value > 0)
            {
                query = query.Skip((page.Value - 1) * pageSize.Value).Take(pageSize.Value);
            }

            var list = await query
                .Include(p => p.CategoryProduct)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Description,
                    p.Price,
                    p.StockQuantity,
                    p.ImageUrl,
                    p.CategoryProductId,
                    CategoryProductName = p.CategoryProduct != null ? p.CategoryProduct.Name : null
                })
                .ToListAsync();
            return Ok(list);
        }

        // GET: api/products/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _context.Products
                .Include(p => p.CategoryProduct)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Description,
                    p.Price,
                    p.StockQuantity,
                    p.ImageUrl,
                    p.CategoryProductId,
                    CategoryProductName = p.CategoryProduct != null ? p.CategoryProduct.Name : null
                })
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                return NotFound(new { message = "Không tìm thấy sản phẩm" });
            }
            return Ok(product);
        }

        // POST: api/products
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Product product)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Kiểm tra danh mục sản phẩm tồn tại
            var categoryExists = await _context.CategoryProducts.AnyAsync(c => c.Id == product.CategoryProductId);
            if (!categoryExists)
            {
                return BadRequest(new { message = "Danh mục sản phẩm không tồn tại" });
            }

            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
        }

        // PUT: api/products/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Product product)
        {
            if (id != product.Id)
            {
                return BadRequest(new { message = "ID không trùng khớp" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Kiểm tra danh mục sản phẩm tồn tại
            var categoryExists = await _context.CategoryProducts.AnyAsync(c => c.Id == product.CategoryProductId);
            if (!categoryExists)
            {
                return BadRequest(new { message = "Danh mục sản phẩm không tồn tại" });
            }

            _context.Entry(product).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Products.Any(p => p.Id == id))
                {
                    return NotFound(new { message = "Không tìm thấy sản phẩm để cập nhật" });
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/products/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound(new { message = "Không tìm thấy sản phẩm" });
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Xóa sản phẩm thành công" });
        }
    }
}
