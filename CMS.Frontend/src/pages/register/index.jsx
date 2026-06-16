import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import customerService from '../../services/customerService';

function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        password: formData.password
      };
      
      await customerService.register(payload);
      setSuccess('Đăng ký tài khoản thành công! Đang chuyển hướng đến trang đăng nhập...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <div className="container flex-grow-1 d-flex align-items-center justify-content-center py-5">
        <div className="card shadow border-0 p-4 col-12 col-md-8 col-lg-5" style={{ borderRadius: '15px' }}>
          <h3 className="fw-bold text-center font-serif text-charcoal mb-4">ĐĂNG KÝ TÀI KHOẢN</h3>
          
          {error && (
            <div className="alert alert-danger py-2 text-start" role="alert" style={{ fontSize: '0.85rem' }}>
              <i className="bi bi-exclamation-triangle me-2"></i> {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success py-2 text-start" role="alert" style={{ fontSize: '0.85rem' }}>
              <i className="bi bi-check-circle me-2"></i> {success}
            </div>
          )}

          <form onSubmit={handleRegister} className="text-start">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label small fw-semibold text-secondary">Họ và Tên *</label>
                <input
                  type="text"
                  name="fullName"
                  className="form-control"
                  placeholder="Nguyễn Văn A"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label small fw-semibold text-secondary">Email *</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label small fw-semibold text-secondary">Số điện thoại</label>
                <input
                  type="text"
                  name="phone"
                  className="form-control"
                  placeholder="0901234567"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label small fw-semibold text-secondary">Địa chỉ giao hàng</label>
                <input
                  type="text"
                  name="address"
                  className="form-control"
                  placeholder="Số nhà, Tên đường, Quận, TP"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-4">
                <label className="form-label small fw-semibold text-secondary">Mật khẩu *</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="Tối thiểu 6 ký tự"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-4">
                <label className="form-label small fw-semibold text-secondary">Xác nhận mật khẩu *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-control"
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-dark w-100 py-2.5 fw-bold text-uppercase"
              style={{ borderRadius: '25px', letterSpacing: '1px' }}
              disabled={loading}
            >
              {loading ? 'Đang tạo tài khoản...' : 'ĐĂNG KÝ'}
            </button>
          </form>

          <p className="mt-4 text-center text-muted small mb-0">
            Đã có tài khoản? <Link to="/login" className="text-dark fw-bold text-decoration-none">Đăng nhập</Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Register;
