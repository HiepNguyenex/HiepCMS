//sinh vien: nguyen vu hiep
//mssv:2123110161
//ngay tao:15/5/26

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CMS.Data.Entities
{
    public class Post
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Tiêu đề bài viết không được để trống.")]
        [StringLength(200, ErrorMessage = "Tiêu đề không được vượt quá 200 ký tự.")]
        public string Title { get; set; } // Tiêu đề bài viết

        [Required(ErrorMessage = "Nội dung bài viết không được để trống.")]
        public string Content { get; set; } // Nội dung chi tiết

        public string? ImageUrl { get; set; } // Hình ảnh đại diện
        public DateTime CreatedDate { get; set; } = DateTime.Now;

        // Khóa ngoại liên kết tới Category
        [Range(1, int.MaxValue, ErrorMessage = "Vui lòng chọn một chuyên mục hợp lệ.")]
        public int CategoryId { get; set; }
        public virtual Category? Category { get; set; }
    }
}

