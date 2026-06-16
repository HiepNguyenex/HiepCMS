import React from 'react';

function ShopHeader({ totalItems, searchTerm, onSearchChange, sortBy, onSortChange }) {
  return (
    <div className="card border-0 shadow-sm mb-4 p-3 bg-white" style={{ borderRadius: '12px' }}>
      <div className="row g-3 align-items-center justify-content-between text-start">
        {/* Total count */}
        <div className="col-md-3">
          <span className="text-muted small">
            Hiển thị <strong className="text-dark">{totalItems}</strong> chai nước hoa
          </span>
        </div>

        {/* Search inside shop */}
        <div className="col-md-5">
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-light border-0"><i className="bi bi-search"></i></span>
            <input
              type="text"
              className="form-control bg-light border-0"
              placeholder="Tìm kiếm nhanh sản phẩm..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {/* Sort options */}
        <div className="col-md-4 d-flex align-items-center gap-2 justify-content-md-end">
          <span className="text-muted small text-nowrap">Sắp xếp:</span>
          <select
            className="form-select form-select-sm border-0 bg-light fw-semibold text-charcoal"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            style={{ width: '170px', fontSize: '0.8rem' }}
          >
            <option value="default">Mặc định</option>
            <option value="priceAsc">Giá: Thấp đến Cao</option>
            <option value="priceDesc">Giá: Cao đến Thấp</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default ShopHeader;
