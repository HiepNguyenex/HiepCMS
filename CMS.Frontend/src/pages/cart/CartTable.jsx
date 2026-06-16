import React from 'react';
import { Link } from 'react-router-dom';

function CartTable({ cartItems, onUpdateQuantity, onRemoveItem }) {
  const formatPrice = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="table-responsive bg-white shadow-sm p-3" style={{ borderRadius: '12px' }}>
      <table className="table align-middle mb-0 text-start">
        <thead>
          <tr className="text-uppercase small fw-bold text-secondary" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
            <th scope="col" style={{ width: '45%' }}>Sản phẩm</th>
            <th scope="col" style={{ width: '15%' }}>Giá</th>
            <th scope="col" style={{ width: '20%' }}>Số lượng</th>
            <th scope="col" style={{ width: '15%' }}>Tổng</th>
            <th scope="col" style={{ width: '5%' }}></th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map((item) => (
            <tr key={`${item.id}-${item.volume}`} className="border-bottom border-light">
              <td>
                <div className="d-flex align-items-center gap-3">
                  <div style={{ width: '70px', height: '70px', backgroundColor: '#F7F6F3', borderRadius: '8px', padding: '5px' }} className="d-flex align-items-center justify-content-center">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600'; }}
                    />
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold text-charcoal" style={{ fontSize: '0.95rem' }}>
                      <Link to={`/product/${item.id}`} className="text-decoration-none text-charcoal">{item.name}</Link>
                    </h6>
                    <span className="text-muted small text-uppercase">Dung tích: {item.volume}</span>
                  </div>
                </div>
              </td>
              <td>
                <span className="fw-semibold text-charcoal" style={{ fontSize: '0.95rem' }}>{formatPrice(item.price)}</span>
              </td>
              <td>
                <div className="input-group input-group-sm" style={{ width: '100px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '20px', overflow: 'hidden' }}>
                  <button
                    className="btn btn-light border-0 py-1"
                    type="button"
                    onClick={() => onUpdateQuantity(item.id, item.volume, item.quantity - 1)}
                  >
                    <i className="bi bi-dash"></i>
                  </button>
                  <input
                    type="text"
                    className="form-control text-center border-0 bg-white p-0 fw-bold"
                    value={item.quantity}
                    readOnly
                  />
                  <button
                    className="btn btn-light border-0 py-1"
                    type="button"
                    onClick={() => onUpdateQuantity(item.id, item.volume, item.quantity + 1)}
                  >
                    <i className="bi bi-plus"></i>
                  </button>
                </div>
              </td>
              <td>
                <span className="fw-bold text-charcoal" style={{ fontSize: '1rem' }}>{formatPrice(item.price * item.quantity)}</span>
              </td>
              <td>
                <button
                  className="btn btn-link text-danger p-0"
                  onClick={() => onRemoveItem(item.id, item.volume)}
                  title="Xóa khỏi giỏ"
                >
                  <i className="bi bi-trash fs-5"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CartTable;
