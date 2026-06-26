//sinh vien: nguyen vu hiep
//mssv:2123110161
//ngay tao:15/5/26

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using System.ComponentModel.DataAnnotations;

namespace CMS.Data.Entities
{
    // Khách hàng
    public class Customer
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string FullName { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        public string? Phone { get; set; }

        public string? Address { get; set; }

        public string? Password { get; set; } // Lưu mật khẩu thô theo yêu cầu tối giản

        public virtual ICollection<Order>? Orders { get; set; }
    }
}
