import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CartTable from './CartTable';

function Cart() {
  const [cartItems, setCartItems] = useState([]);

  const loadCart = () => {
    const stored = localStorage.getItem('cart');
    if (stored) {
      try {
        setCartItems(JSON.parse(stored));
      } catch (e) {
        setCartItems([]);
      }
    } else {
      setCartItems([]);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleUpdateQuantity = (id, volume, newQty) => {
    if (newQty < 1) return;
    
    const updated = cartItems.map((item) => {
      if (item.id === id && item.volume === volume) {
        if (newQty > item.stockQuantity) {
          alert(`Không thể tăng số lượng. Sản phẩm này chỉ còn ${item.stockQuantity} chai trong kho.`);
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    });

    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cartChange'));
  };

  const handleRemoveItem = (id, volume) => {
    const filtered = cartItems.filter((item) => !(item.id === id && item.volume === volume));
    setCartItems(filtered);
    localStorage.setItem('cart', JSON.stringify(filtered));
    window.dispatchEvent(new Event('cartChange'));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: '#F8F7F4' }}>
      <Header />

      {/* Page Title */}
      <div className="bg-white py-4 shadow-sm border-bottom text-start">
        <div className="container px-4">
          <nav aria-label="breadcrumb" className="mb-2">
            <ol className="breadcrumb mb-0 text-uppercase small" style={{ letterSpacing: '1px' }}>
              <li className="breadcrumb-item"><a href="/" className="text-decoration-none text-charcoal">Trang chủ</a></li>
              <li className="breadcrumb-item active text-muted-warm" aria-current="page" style={{ fontWeight: '600' }}>Giỏ hàng</li>
            </ol>
          </nav>
          <h2 className="fw-bold font-serif mb-0 text-charcoal">GIỎ HÀNG CỦA BẠN</h2>
        </div>
      </div>

      {/* Main Layout */}
      <div className="container flex-grow-1 py-5 px-4 text-start">
        {cartItems.length === 0 ? (
          <div className="text-center py-5 bg-white shadow-sm p-4" style={{ borderRadius: '16px' }}>
            <i className="bi bi-bag-x fs-1 text-muted-warm d-block mb-3"></i>
            <h4 className="fw-bold font-serif text-charcoal mb-2">GIỎ HÀNG TRỐNG</h4>
            <p className="text-muted-warm small mb-4">Bạn chưa chọn chai nước hoa nào cho bộ sưu tập của mình.</p>
            <Link to="/shop" className="btn btn-dark px-4 py-2 rounded-pill fw-bold" style={{ fontSize: '0.85rem' }}>
              MUA SẮM NGAY
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            {/* Table of items */}
            <div className="col-lg-8">
              <CartTable
                cartItems={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
              />
            </div>

            {/* Cart summary card */}
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm p-4 bg-white" style={{ borderRadius: '12px' }}>
                <h5 className="fw-bold font-serif mb-4 pb-2 border-bottom text-charcoal" style={{ fontSize: '1.1rem' }}>
                  TỔNG ĐƠN HÀNG
                </h5>
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-secondary small">Tạm tính:</span>
                  <span className="fw-semibold text-charcoal">{formatPrice(calculateSubtotal())}</span>
                </div>
                <div className="d-flex justify-content-between mb-4">
                  <span className="text-secondary small">Vận chuyển:</span>
                  <span className="text-success small fw-semibold">Miễn phí</span>
                </div>
                <div className="d-flex justify-content-between mb-4 pt-3 border-top">
                  <span className="fw-bold text-charcoal">Tổng cộng:</span>
                  <span className="fw-bold text-dark fs-5">{formatPrice(calculateSubtotal())}</span>
                </div>
                <Link
                  to="/checkout"
                  className="btn btn-dark w-100 py-3 rounded-pill fw-bold text-uppercase"
                  style={{ fontSize: '0.8rem', letterSpacing: '1px' }}
                >
                  Tiến hành thanh toán
                </Link>
                <Link to="/shop" className="btn btn-link text-charcoal text-center w-100 mt-3 small text-decoration-none fw-semibold">
                  <i className="bi bi-arrow-left me-1"></i> Tiếp tục mua sắm
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Cart;
