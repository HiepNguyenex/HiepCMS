# 🌟 HiepPerfume.Fashion - Hệ Thống Quản Lý Bán Hàng Nước Hoa & Quản Trị Nội Dung (CMS)

Dự án xây dựng giải pháp thương mại điện tử trực tuyến toàn diện dành riêng cho ngành hàng nước hoa cao cấp, kết hợp giữa mô hình quản trị hành chính **ASP.NET Core 8.0 MVC (Backend)** và ứng dụng mua sắm một trang SPA **React 19 (Frontend)**.

---

## 🎓 THÔNG TIN SINH VIÊN
*   **Sinh viên thực hiện:** Nguyễn Vủ Hiệp
*   **Mã số sinh viên (MSSV):** 2123110161
*   **Lớp học:** CCQ2311E
*   **Môn học:** Chuyên đề ASP.NET
*   **Tên Solution:** HiepCMS_Solution

---

## 🏗️ Tổng Quan Kiến Trúc Dự Án
Giải pháp được chia làm 3 phân tầng dự án độc lập, rõ ràng nhằm đảm bảo hiệu năng và tính tái sử dụng mã nguồn:

```text
HiepCMS_Solution/
├── 📂 CMS.Backend/         # Dự án Web API & Giao diện quản trị MVC (ASP.NET Core 8.0)
│   ├── 📂 Controllers/     # API Controllers phục vụ React Client & Controllers cho MVC Views
│   ├── 📂 Views/           # Giao diện quản lý hành chính (Razor HTML) cho admin
│   └── 📄 Program.cs       # File cấu hình CORS, Auth Cookie, Swagger & Seed Data mẫu
│
├── 📂 CMS.Data/            # Thư viện Class Library quản lý dữ liệu (C# Entity Framework Core)
│   ├── 📂 Entities/        # Định nghĩa 9 thực thể C# cấu thành cơ sở dữ liệu quan hệ
│   └── 📄 ApplicationDbContext.cs # Đối tượng quản lý kết nối và truy vấn CSDL
│
└── 📂 CMS.Frontend/        # Giao diện website mua sắm cho khách hàng (ReactJS 19 SPA)
    ├── 📂 src/             # Source code React components, pages và axiosClient
    └── 📄 package.json     # Quản lý dependency và lệnh khởi chạy
```

---

## ⚡ Các Tính Năng Nổi Bật

### 1. Phân hệ Bán hàng (Frontend - ReactJS)
*   **Trang chủ (Home):** Banner giới thiệu ấn tượng, hiển thị các sản phẩm bán chạy, danh mục thương hiệu nước hoa và tin tức mùi hương mới nhất.
*   **Trang cửa hàng (Shop):** Tìm kiếm thời gian thực, lọc sản phẩm theo danh mục và kéo trượt bộ lọc theo khoảng giá.
*   **Trang chi tiết (ProductDetail):** Hiển thị thông tin chi tiết sản phẩm nước hoa cùng các thành phần mùi hương liên quan (Ingredients) được đề xuất.
*   **Giỏ hàng & Thanh toán (Cart & Checkout):** Quản lý giỏ hàng trực quan thông qua LocalStorage, cho phép người dùng chọn hình thức thanh toán COD hoặc Stripe Online.
*   **Tích hợp cổng thanh toán trực tuyến Stripe:** Hỗ trợ thanh toán thẻ tín dụng an toàn thông qua cổng **Stripe Checkout Session** chính chủ.
*   **Hệ thống Toast Notification cao cấp:** Giao diện Toast được thiết kế theo phong cách **Glassmorphism (backdrop-filter: blur(10px))** sang trọng, thay thế hoàn toàn hộp thoại `alert()` thô sơ của trình duyệt.
*   **Tự động gửi Email hóa đơn:** Sau khi khách đặt hàng thành công hoặc thanh toán qua Stripe thành công, hệ thống tự động kích hoạt gửi Email hóa đơn xác nhận (bằng HTML) qua Gmail.
*   **Lịch sử đơn hàng (Order History):** Khách hàng dễ dàng tra cứu danh sách hóa đơn cá nhân kèm theo trạng thái giao hàng chi tiết.

### 2. Phân hệ Quản trị (Backend CMS - ASP.NET Core 8.0 MVC)
*   **Đăng nhập bảo mật:** Xác thực người dùng bằng Cookie Authentication và mã hóa mật khẩu bảo mật nâng cao.
*   **Quản lý nghiệp vụ (CRUD):** CRUD danh mục sản phẩm, sản phẩm nước hoa, danh mục bài viết và bài viết tin tức.
*   **Hệ thống API nâng cao (Advanced Query Parameters):** Tích hợp tìm kiếm nâng cao (`search`), lọc thông minh (khoảng giá `minPrice`/`maxPrice`, ngày đăng `minDate`/`maxDate`, trạng thái kho `inStockOnly`), sắp xếp linh hoạt (`sortBy` + `isDescending`) và phân trang dữ liệu (`page` + `pageSize`) trên cả 9 API `GET` lấy danh sách.
*   **Rich Text Editor:** Tích hợp CKEditor viết bài chuẩn SEO, upload hình ảnh trực tiếp lên thư mục máy chủ Backend.
*   **Quản lý Đơn hàng:** Kiểm tra danh sách hóa đơn từ khách hàng, phê duyệt/hủy tiến trình đơn hàng và tự động cập nhật lại số lượng tồn kho sản phẩm.

---

## 💾 Cấu Trúc Cơ Sở Dữ Liệu (9 Thực Thể)
1.  `User`: Tài khoản Admin / Editor vận hành trang CMS.
2.  `Category`: Danh mục bài viết tin tức.
3.  `Post`: Nội dung bài viết tin tức giới thiệu mùi hương.
4.  `CategoryProduct`: Danh mục sản phẩm nước hoa.
5.  `Product`: Chi tiết sản phẩm nước hoa cao cấp.
6.  `Ingredient`: Các thành phần nguyên liệu cấu tạo nước hoa (Đàn Hương, Muối Biển, Hổ Phách,...).
7.  `Customer`: Tài khoản đăng ký mua sắm của khách hàng.
8.  `Order`: Hóa đơn mua hàng khách hàng đặt.
9.  `OrderDetail`: Chi tiết số lượng và đơn giá của từng mặt hàng trong hóa đơn.

---

## 🚀 CÁCH KHỞI CHẠY NHANH NHẤT (QUICK START)

Thực hiện lần lượt 3 bước sau để chạy toàn bộ hệ thống trên máy cục bộ:

### Bước 1: Cấu hình Connection String & API Keys
Mở file [appsettings.json](file:///d:/Bai%20Tap/CMS/HiepCMS_Solution/CMS.Backend/appsettings.json) trong `CMS.Backend` và thay đổi thông tin kết nối CSDL, SMTP Email và Stripe Keys của bạn:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER_NAME;Database=HiepCMS_DB;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
  },
  "EmailSettings": {
    "MailServer": "smtp.gmail.com",
    "MailPort": 587,
    "SenderName": "HiepCMS Perfume Shop",
    "SenderEmail": "nguyenvuhiep401@gmail.com",
    "Password": "YOUR_GMAIL_APP_PASSWORD"
  },
  "Stripe": {
    "SecretKey": "sk_test_...",
    "PublishableKey": "pk_test_..."
  }
}
```

### Bước 2: Cập nhật CSDL & Tự Động Seed Dữ Liệu Mẫu
Mở terminal tại thư mục gốc dự án và chạy câu lệnh cập nhật Database (hệ thống sẽ tự động khởi tạo cơ sở dữ liệu và seed sẵn sản phẩm mẫu, danh mục, bài viết, thành phần mùi hương vào SQL Server nếu CSDL trống):
```powershell
dotnet ef database update --project CMS.Data --startup-project CMS.Backend
```

### Bước 3: Khởi chạy song song Backend & Frontend

1.  **Chạy Backend Web API (ASP.NET Core):**
    ```powershell
    dotnet run --project CMS.Backend
    ```
    *   *Địa chỉ API & MVC Admin:* [http://localhost:5288](http://localhost:5288) hoặc [https://localhost:7005](https://localhost:7005)
    *   *Tài liệu API Swagger:* [http://localhost:5288/swagger](http://localhost:5288/swagger)
    *   *Tài khoản Admin mặc định:* `admin` / mật khẩu `123456`

2.  **Chạy Frontend Client (ReactJS):**
    Mở một cửa sổ Terminal mới, di chuyển vào thư mục Frontend và khởi chạy:
    ```powershell
    cd CMS.Frontend
    npm start
    ```
    *   *Địa chỉ giao diện Client:* [http://localhost:3000](http://localhost:3000)

---
*Chúc bạn thực hành tốt đồ án môn học!*
