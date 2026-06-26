import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import paymentService from '../../services/paymentService';

function CheckoutSuccess() {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const confirmStripePayment = async () => {
      const query = new URLSearchParams(window.location.search);
      const sessionId = query.get('session_id');
      const orderIdStr = query.get('order_id');

      if (!sessionId || !orderIdStr) {
        setError('Thông tin thanh toán không hợp lệ (Thiếu Session ID hoặc Order ID).');
        setLoading(false);
        return;
      }

      const orderId = parseInt(orderIdStr, 10);

      try {
        await paymentService.confirmPayment(sessionId, orderId);
        
        // Dọn dẹp giỏ hàng
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('cartChange'));
        
        setSuccess(true);
      } catch (err) {
        const errMsg = err.response?.data?.message || 'Không thể xác thực giao dịch với Stripe. Vui lòng liên hệ support.';
        setError(errMsg);
      } finally {
        setLoading(false);
      }
    };

    confirmStripePayment();
  }, []);

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: '#F8F7F4' }}>
      <Header />
      
      <div className="container flex-grow-1 d-flex align-items-center justify-content-center py-5">
        <div className="card shadow border-0 p-5 col-12 col-md-8 col-lg-6 text-center bg-white" style={{ borderRadius: '16px' }}>
          {loading ? (
            <div className="py-4">
              <div className="spinner-border text-success mb-3" role="status" style={{ width: '3.5rem', height: '3.5rem' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <h4 className="fw-bold text-charcoal mb-2">Đang xác thực thanh toán</h4>
              <p className="text-muted-warm small">Vui lòng không tắt hoặc tải lại trang web này trong lúc chúng tôi đối soát giao dịch với Stripe.</p>
            </div>
          ) : success ? (
            <div>
              <div className="mb-4">
                <i className="bi bi-shield-check text-success" style={{ fontSize: '5rem' }}></i>
              </div>
              <h3 className="fw-bold font-serif text-charcoal mb-3">THANH TOÁN THÀNH CÔNG!</h3>
              <p className="text-muted-warm mb-4">
                Cảm ơn bạn đã lựa chọn HiepPerfume. Giao dịch online của bạn đã được cổng Stripe xác nhận thành công. Hóa đơn chi tiết đã được gửi về email của bạn.
              </p>
              
              <button
                onClick={() => navigate('/')}
                className="btn btn-success px-5 py-3 rounded-pill fw-bold text-uppercase"
                style={{ fontSize: '0.8rem', letterSpacing: '1px' }}
              >
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <i className="bi bi-x-circle text-danger" style={{ fontSize: '5rem' }}></i>
              </div>
              <h3 className="fw-bold font-serif text-charcoal mb-3">GIAO DỊCH THẤT BẠI!</h3>
              <p className="text-danger fw-semibold mb-3">{error}</p>
              <p className="text-muted-warm mb-4">
                Đã xảy ra lỗi trong quá trình đối soát hoặc thẻ của bạn bị từ chối. Vui lòng liên hệ hotline: 0909.XXX.XXX để được xử lý nhanh chóng.
              </p>
              
              <button
                onClick={() => navigate('/cart')}
                className="btn btn-dark px-5 py-3 rounded-pill fw-bold text-uppercase"
                style={{ fontSize: '0.8rem', letterSpacing: '1px' }}
              >
                Quay lại giỏ hàng
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default CheckoutSuccess;
