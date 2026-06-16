import React, { useState, useEffect } from 'react';
import categoryProductService from '../../services/categoryProductService';

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

  if (loading) {
    return (
      <div className="container my-3 text-center">
        <div className="spinner-border spinner-border-sm text-dark" role="status"></div>
        <span className="ms-2 text-muted" style={{ fontSize: '14px' }}>Đang nạp danh mục nước hoa...</span>
      </div>
    );
  }

  return (
    <section id="category-menu-section" className="category-menu-wrapper my-4">
      <div className="container px-4">
        <div className="card shadow-sm border-0" style={{ borderRadius: '15px', overflow: 'hidden' }}>
          <div className="card-body p-2 bg-white">
            <ul className="nav nav-pills nav-fill flex-column flex-sm-row">
              <li className="nav-item m-1">
                <button
                  className={`nav-link w-100 fw-bold border-0 text-uppercase py-3 ${activeCategoryId === null ? 'bg-dark text-white' : 'text-secondary bg-transparent'}`}
                  style={{ borderRadius: '10px', fontSize: '13px', transition: '0.3s' }}
                  onClick={() => onCategorySelect(null)}
                >
                  <i className="bi bi-grid-fill me-2"></i> Tất cả
                </button>
              </li>

              {categories.map((cat) => (
                <li className="nav-item m-1" key={cat.id}>
                  <button
                    className={`nav-link w-100 fw-bold border-0 text-uppercase py-3 ${activeCategoryId === cat.id ? 'bg-dark text-white' : 'text-secondary bg-transparent'}`}
                    style={{ borderRadius: '10px', fontSize: '13px', transition: '0.3s' }}
                    onClick={() => onCategorySelect(cat.id)}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CategoryMenu;
