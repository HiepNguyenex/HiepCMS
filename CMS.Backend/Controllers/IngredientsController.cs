using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;
using System.Threading.Tasks;

namespace CMS.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class IngredientsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public IngredientsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/ingredients
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? search,
            [FromQuery] string? sortBy,
            [FromQuery] bool? isDescending,
            [FromQuery] int? page,
            [FromQuery] int? pageSize)
        {
            var query = _context.Ingredients.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(i => i.Title.Contains(search) || i.Description.Contains(search));
            }

            if (!string.IsNullOrEmpty(sortBy))
            {
                switch (sortBy.ToLower())
                {
                    case "title":
                        query = isDescending == true ? query.OrderByDescending(i => i.Title) : query.OrderBy(i => i.Title);
                        break;
                    case "id":
                    default:
                        query = isDescending == true ? query.OrderByDescending(i => i.Id) : query.OrderBy(i => i.Id);
                        break;
                }
            }
            else
            {
                query = query.OrderBy(i => i.Id);
            }

            if (page.HasValue && pageSize.HasValue && page.Value > 0 && pageSize.Value > 0)
            {
                query = query.Skip((page.Value - 1) * pageSize.Value).Take(pageSize.Value);
            }

            var list = await query.ToListAsync();
            return Ok(list);
        }
    }
}
