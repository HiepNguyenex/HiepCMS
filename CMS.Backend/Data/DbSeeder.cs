using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;

namespace CMS.Backend.Data
{
    public static class DbSeeder
    {
        public static void Seed(ApplicationDbContext context)
        {
            context.Database.EnsureCreated();

            // Check if Ingredients table exists and create it if not
            try
            {
                context.Database.ExecuteSqlRaw(@"
                    IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Ingredients]') AND type in (N'U'))
                    BEGIN
                        CREATE TABLE [dbo].[Ingredients] (
                            [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                            [Title] NVARCHAR(100) NOT NULL,
                            [Description] NVARCHAR(MAX) NOT NULL,
                            [ImageUrl] NVARCHAR(MAX) NOT NULL
                        );
                    END
                ");
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error checking/creating Ingredients table: " + ex.Message);
            }

            // Seed Ingredients (if empty)
            if (!context.Ingredients.Any())
            {
                var seedIngredients = new List<Ingredient>
                {
                    new Ingredient
                    {
                        Title = "Gỗ Đàn Hương",
                        Description = "Ấm áp, kem mịn và đậm đà hương gỗ tự nhiên, mang lại cảm giác bình yên, sâu lắng.",
                        ImageUrl = "/sandalwood.jpg"
                    },
                    new Ingredient
                    {
                        Title = "Muối Biển",
                        Description = "Mát lạnh, mặn mòi đầy sảng khoái từ đại dương xanh thẳm, khơi gợi cảm hứng tự do phiêu lưu.",
                        ImageUrl = "/seasalt.jpg"
                    },
                    new Ingredient
                    {
                        Title = "Hổ Phách",
                        Description = "Ngọt ngào hương nhựa cây kết hợp mật ong ấm áp, tạo nên chiều sâu gợi cảm và bí ẩn đầy mê hoặc.",
                        ImageUrl = "/amber.jpg"
                    }
                };

                context.Ingredients.AddRange(seedIngredients);
                context.SaveChanges();
            }
            else
            {
                // Force update unsplash URLs back to original local image assets
                var sandalwoodIng = context.Ingredients.FirstOrDefault(i => i.Title.Contains("Đàn Hương"));
                if (sandalwoodIng != null && sandalwoodIng.ImageUrl.Contains("unsplash.com"))
                {
                    sandalwoodIng.ImageUrl = "/sandalwood.jpg";
                }
                var seasaltIng = context.Ingredients.FirstOrDefault(i => i.Title.Contains("Muối Biển"));
                if (seasaltIng != null && seasaltIng.ImageUrl.Contains("unsplash.com"))
                {
                    seasaltIng.ImageUrl = "/seasalt.jpg";
                }
                var amberIng = context.Ingredients.FirstOrDefault(i => i.Title.Contains("Hổ Phách"));
                if (amberIng != null && amberIng.ImageUrl.Contains("unsplash.com"))
                {
                    amberIng.ImageUrl = "/amber.jpg";
                }
                context.SaveChanges();
            }

            // Clear old clothing data to update to perfume
            bool hasClothing = context.CategoryProducts.Any(c => c.Name == "Áo thun" || c.Name == "Quần jean");
            if (hasClothing)
            {
                // Clear dependent tables
                context.OrderDetails.RemoveRange(context.OrderDetails);
                context.Orders.RemoveRange(context.Orders);
                context.Products.RemoveRange(context.Products);
                context.CategoryProducts.RemoveRange(context.CategoryProducts);
                context.SaveChanges();
            }

            // Clear old posts if they contain non-perfume development/health text or contain old categories
            bool hasOldPosts = context.Posts.Any(p => p.Title.Contains("ASP.NET") || p.Title.Contains("ReactJS") || p.Title.Contains("sức khỏe") || !p.Title.Contains("nước hoa") && !p.Title.Contains("mùi hương") && !p.Title.Contains("lưu hương") && !p.Title.Contains("độc bản"));
            if (hasOldPosts)
            {
                context.Posts.RemoveRange(context.Posts);
                context.Categories.RemoveRange(context.Categories);
                context.SaveChanges();
            }

            // 1. Seed Users (if empty)
            if (!context.Users.Any())
            {
                var hasher = new PasswordHasher<User>();
                var admin = new User
                {
                    Username = "admin",
                    FullName = "Nguyễn Vũ Hiệp",
                    Role = "Admin"
                };
                admin.PasswordHash = hasher.HashPassword(admin, "123456");

                var editor = new User
                {
                    Username = "editor",
                    FullName = "Biên Tập Viên",
                    Role = "Editor"
                };
                editor.PasswordHash = hasher.HashPassword(editor, "123456");

                context.Users.AddRange(admin, editor);
                context.SaveChanges();
            }

            // 2. Seed CategoryProducts (if empty)
            if (!context.CategoryProducts.Any())
            {
                var categories = new List<CategoryProduct>
                {
                    new CategoryProduct { Name = "Nước hoa Nam", Description = "Các dòng nước hoa lịch lãm, mạnh mẽ dành cho phái nam" },
                    new CategoryProduct { Name = "Nước hoa Nữ", Description = "Các dòng nước hoa tinh tế, quyến rũ dành cho phái nữ" },
                    new CategoryProduct { Name = "Nước hoa Unisex", Description = "Các dòng nước hoa phi giới tính, cá tính và độc đáo" },
                    new CategoryProduct { Name = "Nước hoa Chiết / Mini", Description = "Các dòng nước hoa chiết dung tích nhỏ 10ml tiện lợi" }
                };

                context.CategoryProducts.AddRange(categories);
                context.SaveChanges();
            }

            // 3. Seed Products (if empty)
            if (!context.Products.Any())
            {
                var catNam = context.CategoryProducts.FirstOrDefault(c => c.Name == "Nước hoa Nam");
                var catNu = context.CategoryProducts.FirstOrDefault(c => c.Name == "Nước hoa Nữ");
                var catUnisex = context.CategoryProducts.FirstOrDefault(c => c.Name == "Nước hoa Unisex");
                var catChiet = context.CategoryProducts.FirstOrDefault(c => c.Name == "Nước hoa Chiết / Mini");

                var products = new List<Product>
                {
                    new Product
                    {
                        Name = "Bleu de Chanel Parfum",
                        Description = "Hương thơm mạnh mẽ, lịch lãm với sự kết hợp của gỗ tuyết tùng và hương bưởi tươi mát.",
                        Price = 3500000,
                        StockQuantity = 15,
                        ImageUrl = "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600",
                        CategoryProductId = catNam.Id
                    },
                    new Product
                    {
                        Name = "Dior Sauvage Eau de Parfum",
                        Description = "Mùi hương hoang dã, phong trần đầy lôi cuốn của cam Bergamot Calabria và hương ambroxan nồng nàn.",
                        Price = 3200000,
                        StockQuantity = 12,
                        ImageUrl = "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600",
                        CategoryProductId = catNam.Id
                    },
                    new Product
                    {
                        Name = "Chanel Coco Mademoiselle",
                        Description = "Biểu tượng quyến rũ khó cưỡng của phái nữ với hương cam tươi mát xen lẫn hoa hồng quyến rũ.",
                        Price = 3600000,
                        StockQuantity = 10,
                        ImageUrl = "https://images.unsplash.com/photo-1588405748373-122b25c86a88?w=600",
                        CategoryProductId = catNu.Id
                    },
                    new Product
                    {
                        Name = "YSL Libre Eau de Parfum",
                        Description = "Mùi hương của tự do, mạnh mẽ và độc lập với sự hòa quyện giữa hoa oải hương Pháp và hoa cam Morocco.",
                        Price = 3100000,
                        StockQuantity = 8,
                        ImageUrl = "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600",
                        CategoryProductId = catNu.Id
                    },
                    new Product
                    {
                        Name = "Tom Ford Lost Cherry",
                        Description = "Hương thơm ngọt ngào, ấm áp đầy khêu gợi từ quả anh đào đen, hạnh nhân đắng và gỗ đàn hương.",
                        Price = 6500000,
                        StockQuantity = 5,
                        ImageUrl = "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600",
                        CategoryProductId = catUnisex.Id
                    },
                    new Product
                    {
                        Name = "Le Labo Santal 33",
                        Description = "Mùi hương độc đáo mang tính nghệ thuật cao với hương gỗ đàn hương, gỗ tuyết tùng và da thuộc mộc mạc.",
                        Price = 5800000,
                        StockQuantity = 7,
                        ImageUrl = "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=600",
                        CategoryProductId = catUnisex.Id
                    },
                    new Product
                    {
                        Name = "Versace Eros Men EDT",
                        Description = "Hương thơm nam tính tươi mát, quyến rũ với bạc hà, táo xanh và đậu tonka nồng nàn.",
                        Price = 1950000,
                        StockQuantity = 20,
                        ImageUrl = "https://images.unsplash.com/photo-1557827983-012eb6ea8dc1?w=600",
                        CategoryProductId = catNam.Id
                    },
                    new Product
                    {
                        Name = "Narciso Rodriguez For Her",
                        Description = "Hương thơm dịu dàng, gợi cảm và đầy nữ tính với xạ hương làm chủ đạo kết hợp hoa mộc tê thanh lịch.",
                        Price = 2800000,
                        StockQuantity = 14,
                        ImageUrl = "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600",
                        CategoryProductId = catNu.Id
                    },
                    new Product
                    {
                        Name = "Nước hoa chiết Creed Aventus 10ml",
                        Description = "Bản chiết 10ml tiện lợi từ chai nước hoa hoàng gia lừng danh với hương dứa nướng và khói gỗ nam tính.",
                        Price = 650000,
                        StockQuantity = 30,
                        ImageUrl = "https://images.unsplash.com/photo-1615655406736-b37c4fabf923?w=600",
                        CategoryProductId = catChiet.Id
                    }
                };

                context.Products.AddRange(products);
                context.SaveChanges();
            }

            // 4. Seed Categories (for Posts, if empty)
            if (!context.Categories.Any())
            {
                var postCategories = new List<Category>
                {
                    new Category { Name = "Cẩm nang nước hoa", Description = "Các bài viết hướng dẫn sử dụng và bảo quản nước hoa" },
                    new Category { Name = "Đánh giá nước hoa", Description = "Review chi tiết các mùi hương nước hoa nổi tiếng" },
                    new Category { Name = "Xu hướng mùi hương", Description = "Cập nhật các xu hướng chọn nước hoa mới nhất theo mùa" }
                };

                context.Categories.AddRange(postCategories);
                context.SaveChanges();
            }

            // 5. Seed Posts (if empty)
            if (!context.Posts.Any())
            {
                var catCamNang = context.Categories.FirstOrDefault(c => c.Name == "Cẩm nang nước hoa");
                var catDanhGia = context.Categories.FirstOrDefault(c => c.Name == "Đánh giá nước hoa");
                var catXuHuong = context.Categories.FirstOrDefault(c => c.Name == "Xu hướng mùi hương");

                var posts = new List<Post>
                {
                    new Post
                    {
                        Title = "Bí quyết chọn nước hoa phù hợp với từng mùa trong năm",
                        Content = "Mỗi mùa trong năm mang một sắc thái và nhiệt độ riêng, ảnh hưởng trực tiếp đến độ tỏa hương và lưu hương của nước hoa. Mùa hè oi bức thích hợp với các hương thơm tươi mát từ cam chanh (Citrus) hay hương biển (Aquatic). Ngược lại, mùa đông lạnh giá là thời điểm lên ngôi của hương gỗ ấm áp, vani ngọt ngào hay hổ phách quyến rũ như Tom Ford Lost Cherry hay Le Labo Santal 33.",
                        ImageUrl = "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=600",
                        CreatedDate = DateTime.Now.AddDays(-5),
                        CategoryId = catXuHuong.Id
                    },
                    new Post
                    {
                        Title = "Độ lưu hương và những yếu tố ảnh hưởng bạn cần biết",
                        Content = "Độ lưu hương của một chai nước hoa phụ thuộc vào nồng độ tinh dầu (EDC, EDT, EDP, Parfum), cơ địa làn da và cách bạn xịt. Làn da khô thường làm nước hoa bay mùi nhanh hơn da dầu, do đó việc thoa một lớp kem dưỡng ẩm mỏng không mùi trước khi xịt sẽ giúp hương thơm bám lâu đáng kể.",
                        ImageUrl = "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600",
                        CreatedDate = DateTime.Now.AddDays(-4),
                        CategoryId = catCamNang.Id
                    },
                    new Post
                    {
                        Title = "Cách phân biệt nước hoa chính hãng và hàng giả (Fake)",
                        Content = "Thị trường nước hoa ngày càng tinh vi khiến việc phân biệt hàng thật - giả trở nên khó khăn. Hãy chú ý đến thiết kế vòi xịt, độ hoàn thiện của thủy tinh, nắp chai và đặc biệt là độ chuyển biến của các nốt hương. Nước hoa chính hãng luôn có sự chuyển tầng hương rõ rệt từ nốt đầu, nốt giữa đến nốt cuối.",
                        ImageUrl = "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600",
                        CreatedDate = DateTime.Now.AddDays(-3),
                        CategoryId = catCamNang.Id
                    },
                    new Post
                    {
                        Title = "Nghệ thuật lưu giữ mùi hương: Xịt nước hoa đúng cách",
                        Content = "Xịt nước hoa tưởng chừng đơn giản nhưng lại là một nghệ thuật. Hãy xịt vào các điểm mạch đập như cổ tay, sau gáy, và khuỷu tay trong. Tránh chà xát hai cổ tay sau khi xịt vì việc này sẽ làm vỡ các phân tử hương thơm, khiến nốt hương đầu bay mùi nhanh hơn.",
                        ImageUrl = "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600",
                        CreatedDate = DateTime.Now.AddDays(-2),
                        CategoryId = catCamNang.Id
                    },
                    new Post
                    {
                        Title = "Xu hướng nước hoa Unisex thống trị thị trường năm 2026",
                        Content = "Nước hoa Unisex - không phân biệt giới tính - đang trở thành xu hướng hàng đầu nhờ sự tự do và phá cách. Những mùi hương như Le Labo Santal 33 hay Tom Ford Lost Cherry mang đến trải nghiệm mùi hương độc đáo, thể hiện cá tính riêng biệt của người sử dụng mà không bị gò bó bởi các quy chuẩn nam hay nữ.",
                        ImageUrl = "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=600",
                        CreatedDate = DateTime.Now.AddDays(-1),
                        CategoryId = catXuHuong.Id
                    },
                    new Post
                    {
                        Title = "Review chi tiết Chanel Coco Mademoiselle - Biểu tượng quyến rũ",
                        Content = "Chanel Coco Mademoiselle là sự kết hợp hoàn hảo giữa nét trẻ trung, hiện đại và sự quý phái, cổ điển. Với hương cam Bergamot tươi mát ở nốt đầu, hoa hồng và hoa nhài dịu dàng ở nốt giữa, kết hợp cùng hoắc hương và cỏ hương bài ấm áp ở nốt cuối, đây xứng đáng là chai nước hoa quốc dân của mọi quý cô.",
                        ImageUrl = "https://images.unsplash.com/photo-1588405748373-122b25c86a88?w=600",
                        CreatedDate = DateTime.Now,
                        CategoryId = catDanhGia.Id
                    }
                };

                context.Posts.AddRange(posts);
                context.SaveChanges();
            }
        }
    }
}
