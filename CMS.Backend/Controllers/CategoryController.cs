//sinh vien: nguyen vu hiep
//mssv:2123110161
//ngay tao:15/5/26

using Microsoft.AspNetCore.Mvc;
using CMS.Data.Entities;

namespace CMS.Backend.Controllers
{
    public class CategoryController : Controller
    {
        public IActionResult Index()
        {
            var list = new List<Category>
            {
                new Category { Id = 1, Name = "Tin Công Nghệ", Description = "Review Laptop, AI" },
                new Category { Id = 2, Name = "Giáo Dục", Description = "Thông tin tuyển sinh" }
            };
            return View(list);
        }
    }
}