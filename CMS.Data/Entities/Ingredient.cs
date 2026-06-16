//sinh vien: nguyen vu hiep
//mssv:2123110161
using System.ComponentModel.DataAnnotations;

namespace CMS.Data.Entities
{
    // Nốt hương / Thành phần nguyên liệu chủ đạo
    public class Ingredient
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "Tiêu đề nốt hương không được để trống.")]
        [StringLength(100, ErrorMessage = "Tiêu đề không được vượt quá 100 ký tự.")]
        public string Title { get; set; } = "";

        [Required(ErrorMessage = "Mô tả nốt hương không được để trống.")]
        public string Description { get; set; } = "";

        [Required(ErrorMessage = "Đường dẫn hình ảnh không được để trống.")]
        public string ImageUrl { get; set; } = "";
    }
}
