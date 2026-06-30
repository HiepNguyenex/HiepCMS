import React, { useState, useEffect } from 'react';
import categoryProductService from '../../services/categoryProductService';

// Cấu hình các hình ảnh nước hoa cao cấp, nghệ thuật từ Unsplash
const CATEGORY_IMAGES = {
  "default": "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=300&q=80",
  "nước hoa nam": "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=300&q=80", // Chai nước hoa nam tính, tông xanh đen lịch lãm
  "nước hoa nữ": "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=300&q=80", // Chai nước hoa hồng quyến rũ bên cạnh cánh hoa hồng
  "nước hoa unisex": "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=300&q=80", // Thiết kế chai hổ phách, sang trọng huyền bí
  "nước hoa chiết / mini": "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=300&q=80", // Chai nước hoa nhỏ cùng hoa nhài thanh lịch
  "nước hoa thơm": "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=300&q=80" // Chai Le Labo tinh tế, tối giản
};

function CategoryMenu({ activeCategoryId, onCategorySelect }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await categoryProductService.getAllCategoryProducts();
        setCategories(data);
      } catch (err) {
        console.error("Lỗi khi lấy danh mục sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Hàm mapping ảnh linh hoạt, chống lỗi bảng mã tiếng Việt (NFC vs NFD)
  const getCategoryImage = (name) => {
    if (!name) return CATEGORY_IMAGES.default;
    const norm = name.toLowerCase().normalize("NFC").trim();
    
    if (norm.includes("nam")) {
      return CATEGORY_IMAGES["nước hoa nam"];
    }
    if (norm.includes("nữ") || norm.includes("nu")) {
      return CATEGORY_IMAGES["nước hoa nữ"];
    }
    if (norm.includes("unisex")) {
      return CATEGORY_IMAGES["nước hoa unisex"];
    }
    if (norm.includes("chiết") || norm.includes("chiet") || norm.includes("mini")) {
      return CATEGORY_IMAGES["nước hoa chiết / mini"];
    }
    if (norm.includes("thơm") || norm.includes("thom")) {
      return CATEGORY_IMAGES["nước hoa thơm"];
    }
    
    return CATEGORY_IMAGES.default;
  };

  if (loading) {
    return (
      <div className="container my-4 text-center">
        <div className="spinner-border spinner-border-sm text-dark" role="status"></div>
        <span className="ms-2 text-muted" style={{ fontSize: '13px', letterSpacing: '0.5px' }}>Đang nạp danh mục nước hoa...</span>
      </div>
    );
  }

  return (
    <section id="category-menu-section" className="my-5">
      {/* Khai báo style CSS cho các hiệu ứng Hover, Active cao cấp */}
      <style>{`
        .category-btn-wrapper {
          width: 120px;
          transition: all 0.3s ease;
        }
        .category-btn-circle {
          position: relative;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          overflow: hidden;
          background: #f8f9fa;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          border: 3px solid #ffffff;
        }
        .category-btn-wrapper:hover .category-btn-circle {
          transform: translateY(-6px) scale(1.04);
          box-shadow: 0 10px 25px rgba(28, 30, 33, 0.12);
          border-color: #d4af37; /* Viền vàng gold sang trọng khi hover */
        }
        .category-btn-wrapper.active .category-btn-circle {
          transform: scale(1.05);
          border-color: #1c1e21; /* Viền đen lịch lãm cho danh mục đang chọn */
          box-shadow: 0 12px 30px rgba(28, 30, 33, 0.18), 0 0 0 4px rgba(28, 30, 33, 0.04);
        }
        .category-btn-text {
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.8px;
          color: #8c8c8c;
          transition: color 0.3s ease, transform 0.3s ease;
          margin-top: 12px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        .category-btn-wrapper:hover .category-btn-text,
        .category-btn-wrapper.active .category-btn-text {
          color: #1c1e21;
          transform: translateY(-2px);
        }
      `}</style>

      <div className="container px-4">
        {/* Khung danh mục căn giữa, hỗ trợ cuộn ngang mượt mà trên mobile */}
        <div className="d-flex justify-content-center align-items-center flex-wrap gap-4 py-2">
          
          {/* Nút danh mục: TẤT CẢ */}
          <div className={`text-center category-btn-wrapper ${activeCategoryId === null ? 'active' : ''}`}>
            <button
              onClick={() => onCategorySelect(null)}
              className="border-0 bg-transparent p-0 position-relative d-inline-block w-100"
              style={{ outline: 'none' }}
            >
              <div className={`category-btn-circle mx-auto ${activeCategoryId === null ? 'active' : ''}`}>
                <img 
                  src={CATEGORY_IMAGES.default} 
                  alt="Tất cả sản phẩm" 
                  className="w-100 h-100 object-fit-cover"
                  style={{ filter: activeCategoryId === null ? 'brightness(95%)' : 'brightness(75%) grayscale(20%)' }}
                />
                <div className="position-absolute w-100 h-100 rounded-circle d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.22)', top: 0, left: 0 }}>
                  <i className="bi bi-grid-fill text-white fs-3"></i>
                </div>
              </div>
              <span className="category-btn-text d-block text-uppercase">
                Tất cả
              </span>
            </button>
          </div>

          {/* Danh sách danh mục lấy động từ database */}
          {categories.map((cat) => {
            const imgUrl = getCategoryImage(cat.name);
            const isActive = activeCategoryId === cat.id;
            return (
              <div className={`text-center category-btn-wrapper ${isActive ? 'active' : ''}`} key={cat.id}>
                <button
                  onClick={() => onCategorySelect(cat.id)}
                  className="border-0 bg-transparent p-0 position-relative d-inline-block w-100"
                  style={{ outline: 'none' }}
                >
                  <div className={`category-btn-circle mx-auto ${isActive ? 'active' : ''}`}>
                    <img 
                      src={imgUrl} 
                      alt={cat.name} 
                      className="w-100 h-100 object-fit-cover"
                      style={{ 
                        filter: isActive ? 'brightness(100%)' : 'brightness(80%)',
                        transition: 'filter 0.3s'
                      }}
                    />
                  </div>
                  <span className="category-btn-text d-block text-uppercase">
                    {cat.name}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CategoryMenu;
