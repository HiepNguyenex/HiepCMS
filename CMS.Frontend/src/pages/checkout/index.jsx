import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import orderService from '../../services/orderService';
import paymentService from '../../services/paymentService';

function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  
  // Shipping info states (pre-filled from customer)
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load cart
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (e) {
        setCartItems([]);
      }
    }

    // Load customer
    const storedCustomer = localStorage.getItem('customer');
    if (storedCustomer) {
      try {
        const parsed = JSON.parse(storedCustomer);
        setCustomer(parsed);
        setShippingInfo({
          fullName: parsed.fullName || parsed.FullName || '',
          email: parsed.email || parsed.Email || '',
          phone: parsed.phone || parsed.Phone || '',
          address: parsed.address || parsed.Address || ''
        });
      } catch (e) {
        setCustomer(null);
      }
    }
  }, []);

  const handleInputChange = (e) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value
    });
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (!customer) {
      setError('Vui lòng đăng nhập tài khoản để đặt hàng.');
      return;
    }

    if (cartItems.length === 0) {
      setError('Giỏ hàng của bạn đang trống.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        customerId: customer.id || customer.Id,
        status: 0, // 0 = Chờ duyệt / Chờ xử lý
        notes: notes || `Giao hàng đến: ${shippingInfo.address}. SĐT: ${shippingInfo.phone}`,
        orderDetails: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.price
        }))
      };

      const response = await orderService.createOrder(payload);
      
      if (paymentMethod === 'stripe') {
        const orderId = response.id || response.Id;
        const session = await paymentService.createCheckoutSession(orderId);
        if (session && session.url) {
          window.location.href = session.url;
          return;
        } else {
          throw new Error("Không thể khởi tạo kết nối thanh toán Stripe.");
        }
      }

      setCreatedOrder(response);
      setOrderSuccess(true);
      
      // Clear cart
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cartChange'));
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Đã có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: '#F8F7F4' }}>
        <Header />
        <div className="container flex-grow-1 d-flex align-items-center justify-content-center py-5">
          <div className="card shadow border-0 p-5 col-12 col-md-8 col-lg-6 text-center bg-white" style={{ borderRadius: '16px' }}>
            <div className="mb-4">
              <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4.5rem' }}></i>
            </div>
            <h3 className="fw-bold font-serif text-charcoal mb-3">ĐẶT HÀNG THÀNH CÔNG!</h3>
            <p className="text-muted-warm mb-4">
              Cảm ơn bạn đã lựa chọn HiepPerfume. Đơn hàng của bạn đã được tiếp nhận và lưu trữ vào cơ sở dữ liệu SQL Server thành công.
            </p>
            
            {createdOrder && (
              <div className="bg-light p-3 rounded-3 text-start mb-4 small">
                <p className="mb-1"><strong>Mã đơn hàng:</strong> #{createdOrder.id || createdOrder.Id}</p>
                <p className="mb-1"><strong>Khách hàng:</strong> {shippingInfo.fullName}</p>
                <p className="mb-1"><strong>Địa chỉ giao hàng:</strong> {shippingInfo.address}</p>
                <p className="mb-0"><strong>Tổng thanh toán:</strong> {formatPrice(calculateSubtotal())}</p>
              </div>
            )}

            <button
              onClick={() => navigate('/')}
              className="btn btn-dark px-5 py-3 rounded-pill fw-bold text-uppercase"
              style={{ fontSize: '0.8rem', letterSpacing: '1px' }}
            >
              Quay lại trang chủ
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: '#F8F7F4' }}>
      <Header />

      {/* Page Title */}
      <div className="bg-white py-4 shadow-sm border-bottom text-start">
        <div className="container px-4">
          <nav aria-label="breadcrumb" className="mb-2">
            <ol className="breadcrumb mb-0 text-uppercase small" style={{ letterSpacing: '1px' }}>
              <li className="breadcrumb-item"><a href="/" className="text-decoration-none text-charcoal">Trang chủ</a></li>
              <li className="breadcrumb-item"><Link to="/cart" className="text-decoration-none text-charcoal">Giỏ hàng</Link></li>
              <li className="breadcrumb-item active text-muted-warm" aria-current="page" style={{ fontWeight: '600' }}>Thanh toán</li>
            </ol>
          </nav>
          <h2 className="fw-bold font-serif mb-0 text-charcoal">TIẾN HÀNH THANH TOÁN</h2>
        </div>
      </div>

      {/* Main Layout */}
      <div className="container flex-grow-1 py-5 px-4 text-start">
        {!customer ? (
          <div className="text-center py-5 bg-white shadow-sm p-4 col-12 col-md-8 mx-auto" style={{ borderRadius: '16px' }}>
            <i className="bi bi-lock-fill fs-1 text-muted-warm d-block mb-3"></i>
            <h4 className="fw-bold font-serif text-charcoal mb-2">YÊU CẦU ĐĂNG NHẬP</h4>
            <p className="text-muted-warm small mb-4">Bạn cần đăng nhập tài khoản khách hàng để thực hiện chức năng thanh toán.</p>
            <div className="d-flex justify-content-center gap-3">
              <Link to="/login" className="btn btn-dark px-4 py-2.5 rounded-pill fw-bold" style={{ fontSize: '0.85rem' }}>
                ĐĂNG NHẬP
              </Link>
              <Link to="/register" className="btn btn-outline-dark px-4 py-2.5 rounded-pill fw-bold" style={{ fontSize: '0.85rem' }}>
                ĐĂNG KÝ
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="row g-4">
            {/* Left Column: Shipping form */}
            <div className="col-lg-7">
              <div className="card border-0 shadow-sm p-4 bg-white" style={{ borderRadius: '12px' }}>
                <h5 className="fw-bold font-serif mb-4 pb-2 border-bottom text-charcoal" style={{ fontSize: '1.1rem' }}>
                  THÔNG TIN GIAO HÀNG
                </h5>

                {error && (
                  <div className="alert alert-danger py-2 text-start small" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i> {error}
                  </div>
                )}

                <div className="row">
                  <div className="col-12 mb-3">
                    <label className="form-label small fw-semibold text-secondary">Họ và Tên người nhận *</label>
                    <input
                      type="text"
                      name="fullName"
                      className="form-control"
                      value={shippingInfo.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label small fw-semibold text-secondary">Số điện thoại liên lạc *</label>
                    <input
                      type="text"
                      name="phone"
                      className="form-control"
                      value={shippingInfo.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label small fw-semibold text-secondary">Email nhận hóa đơn *</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={shippingInfo.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="col-12 mb-3">
                    <label className="form-label small fw-semibold text-secondary">Địa chỉ giao nhận *</label>
                    <input
                      type="text"
                      name="address"
                      className="form-control"
                      value={shippingInfo.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="col-12 mb-2">
                    <label className="form-label small fw-semibold text-secondary">Ghi chú đơn hàng (Không bắt buộc)</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Ghi chú về thời gian giao hàng, chỉ dẫn địa chỉ chi tiết..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* PHƯƠNG THỨC THANH TOÁN */}
              <div className="card border-0 shadow-sm p-4 bg-white mt-4" style={{ borderRadius: '12px' }}>
                <h5 className="fw-bold font-serif mb-4 pb-2 border-bottom text-charcoal" style={{ fontSize: '1.1rem' }}>
                  PHƯƠNG THỨC THANH TOÁN
                </h5>
                <div className="d-flex flex-column gap-3">
                  <label className="border p-3 rounded d-flex align-items-center justify-content-between cursor-pointer" style={{ cursor: 'pointer', borderColor: paymentMethod === 'cod' ? '#000' : '#ddd', backgroundColor: paymentMethod === 'cod' ? '#fcfcfa' : 'transparent' }}>
                    <div className="d-flex align-items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        style={{ accentColor: '#000', width: '18px', height: '18px' }}
                      />
                      <div>
                        <strong className="d-block small text-charcoal mb-1">Thanh toán khi nhận hàng (COD)</strong>
                        <span className="text-muted-warm" style={{ fontSize: '0.75rem' }}>Thanh toán bằng tiền mặt khi shipper giao hàng tận tay.</span>
                      </div>
                    </div>
                    <i className="bi bi-cash-stack fs-4 text-secondary"></i>
                  </label>

                  <label className="border p-3 rounded d-flex align-items-center justify-content-between cursor-pointer" style={{ cursor: 'pointer', borderColor: paymentMethod === 'stripe' ? '#000' : '#ddd', backgroundColor: paymentMethod === 'stripe' ? '#fcfcfa' : 'transparent' }}>
                    <div className="d-flex align-items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="stripe"
                        checked={paymentMethod === 'stripe'}
                        onChange={() => setPaymentMethod('stripe')}
                        style={{ accentColor: '#000', width: '18px', height: '18px' }}
                      />
                      <div>
                        <strong className="d-block small text-charcoal mb-1">Thẻ tín dụng / Online qua Stripe</strong>
                        <span className="text-muted-warm" style={{ fontSize: '0.75rem' }}>Thanh toán an toàn qua cổng Stripe quốc tế (Sandbox).</span>
                      </div>
                    </div>
                    <i className="bi bi-credit-card-2-back fs-4 text-secondary"></i>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Order summary and CTA */}
            <div className="col-lg-5">
              <div className="card border-0 shadow-sm p-4 bg-white" style={{ borderRadius: '12px' }}>
                <h5 className="fw-bold font-serif mb-4 pb-2 border-bottom text-charcoal" style={{ fontSize: '1.1rem' }}>
                  TÓM TẮT ĐƠN HÀNG
                </h5>

                {/* Items list */}
                <div className="mb-4" style={{ maxHeight: '240px', overflowY: 'auto' }}>
                  {cartItems.map((item) => (
                    <div key={`${item.id}-${item.volume}`} className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom border-light">
                      <div className="d-flex align-items-center gap-2" style={{ maxWidth: '75%' }}>
                        <div style={{ width: '45px', height: '45px', backgroundColor: '#F7F6F3', borderRadius: '6px', padding: '2px' }} className="d-flex align-items-center justify-content-center flex-shrink-0">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                          />
                        </div>
                        <div className="text-truncate">
                          <h6 className="mb-0 fw-semibold text-charcoal text-truncate" style={{ fontSize: '0.85rem' }} title={item.name}>
                            {item.name}
                          </h6>
                          <span className="text-muted-warm text-uppercase" style={{ fontSize: '0.7rem' }}>
                            {item.volume} x {item.quantity}
                          </span>
                        </div>
                      </div>
                      <span className="fw-semibold text-charcoal small">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Pricing totals */}
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-secondary small">Tạm tính:</span>
                  <span className="fw-semibold text-charcoal small">{formatPrice(calculateSubtotal())}</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-secondary small">Vận chuyển:</span>
                  <span className="text-success small fw-semibold">Miễn phí</span>
                </div>
                <div className="d-flex justify-content-between mb-4 pt-3 border-top">
                  <span className="fw-bold text-charcoal">Tổng cộng:</span>
                  <span className="fw-bold text-dark fs-5">{formatPrice(calculateSubtotal())}</span>
                </div>

                <button
                  type="submit"
                  className="btn btn-dark w-100 py-3 rounded-pill fw-bold text-uppercase"
                  style={{ fontSize: '0.8rem', letterSpacing: '1px' }}
                  disabled={loading}
                >
                  {loading ? 'ĐANG XỬ LÝ ĐẶT HÀNG...' : 'ĐẶT HÀNG'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Checkout;
