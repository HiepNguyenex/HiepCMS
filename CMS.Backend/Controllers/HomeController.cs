using CMS.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

public class HomeController : Controller
{
    private readonly ApplicationDbContext _context;

    public HomeController(ApplicationDbContext context)
    {
        _context = context;
    }

    public IActionResult Index()
    {
        var latestPosts = _context.Posts
                          .Include(p => p.Category)        // lấy kèm tên danh mục
                          .OrderByDescending(p => p.CreatedDate)  // mới nhất lên đầu
                          .Take(3)                         // chỉ lấy 3 bài
                          .ToList();

        return View(latestPosts);
    }
}