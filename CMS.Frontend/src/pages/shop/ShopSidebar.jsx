import React, { useState, useEffect } from 'react';
import categoryProductService from '../../services/categoryProductService';

function ShopSidebar({ activeCategoryId, onCategorySelect, minPrice, maxPrice, onMinPriceChange, onMaxPriceChange }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await categoryProductService.getAllCategoryProducts();
        setCategories(data);
      } catch (err) {
        console.error("Lỗi khi tải danh mục ở ShopSidebar:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const formatPriceLabel = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="shop-sidebar p-3 bg-white shadow-sm" style={{ borderRadius: '12px' }}>
      {/* Category Filter */}
      <div className="mb-4 text-start">
        <h5 className="fw-bold font-serif mb-3 pb-2 border-bottom text-charcoal" style={{ fontSize: '1.1rem' }}>
          DANH MỤC NƯỚC HOA
        </h5>
        {loading ? (
          <div className="text-center py-2">
            <div className="spinner-border spinner-border-sm text-dark" role="status"></div>
          </div>
        ) : (
          <ul className="list-unstyled">
            <li className="mb-2">
              <button
                className={`btn btn-link p-0 text-decoration-none text-start w-100 ${activeCategoryId === null ? 'fw-bold text-dark' : 'text-secondary'}`}
                onClick={() => onCategorySelect(null)}
                style={{ fontSize: '0.9rem' }}
              >
                <i className="bi bi-chevron-right me-1" style={{ fontSize: '10px' }}></i> Tất cả
              </button>
            </li>
            {categories.map((cat) => (
              <li className="mb-2" key={cat.id}>
                <button
                  className={`btn btn-link p-0 text-decoration-none text-start w-100 ${activeCategoryId === cat.id ? 'fw-bold text-dark' : 'text-secondary'}`}
                  onClick={() => onCategorySelect(cat.id)}
                  style={{ fontSize: '0.9rem' }}
                >
                  <i className="bi bi-chevron-right me-1" style={{ fontSize: '10px' }}></i> {cat.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Price Filter */}
      <div className="mb-2 text-start">
        <h5 className="fw-bold font-serif mb-3 pb-2 border-bottom text-charcoal" style={{ fontSize: '1.1rem' }}>
          KHOẢNG GIÁ
        </h5>
        
        {/* Min & Max Inputs */}
        <div className="d-flex gap-2 mb-3">
          <div className="flex-fill">
            <label className="small text-muted mb-1 fw-semibold">Từ</label>
            <input
              type="number"
              className="form-control form-control-sm"
              min="0"
              max={maxPrice}
              step="100000"
              placeholder="0"
              value={minPrice}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                if (val <= maxPrice) onMinPriceChange(val);
              }}
              style={{ borderRadius: '8px', fontSize: '0.85rem' }}
            />
          </div>
          <div className="flex-fill">
            <label className="small text-muted mb-1 fw-semibold">Đến</label>
            <input
              type="number"
              className="form-control form-control-sm"
              min={minPrice}
              max="10000000"
              step="100000"
              placeholder="5.000.000"
              value={maxPrice}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                if (val >= minPrice) onMaxPriceChange(val);
              }}
              style={{ borderRadius: '8px', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {/* Range Slider */}
        <div className="px-1">
          <div className="d-flex justify-content-between small text-muted mb-1">
            <span>{formatPriceLabel(minPrice)}</span>
            <span className="fw-bold text-charcoal">{formatPriceLabel(maxPrice)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShopSidebar;
