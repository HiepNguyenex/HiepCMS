import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import customerService from '../../services/customerService';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const customer = await customerService.login(email, password);
      localStorage.setItem('customer', JSON.stringify(customer));
      // Bắn sự kiện toàn cục để cập nhật Header ngay lập tức
      window.dispatchEvent(new Event('customerAuthChange'));
      navigate('/');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <div className="container flex-grow-1 d-flex align-items-center justify-content-center py-5">
        <div className="card shadow border-0 p-4 col-12 col-md-6 col-lg-4" style={{ borderRadius: '15px' }}>
          <h3 className="fw-bold text-center font-serif text-charcoal mb-4">ĐĂNG NHẬP</h3>
          
          {error && (
            <div className="alert alert-danger py-2 text-start" role="alert" style={{ fontSize: '0.85rem' }}>
              <i className="bi bi-exclamation-triangle me-2"></i> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="text-start">
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="username@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold text-secondary">Mật khẩu</label>
              <input
                type="password"
                className="form-control"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-dark w-100 py-2.5 fw-bold text-uppercase"
              style={{ borderRadius: '25px', letterSpacing: '1px' }}
              disabled={loading}
            >
              {loading ? 'Đang xác thực...' : 'ĐĂNG NHẬP'}
            </button>
          </form>

          <p className="mt-4 text-center text-muted small mb-0">
            Chưa có tài khoản? <Link to="/register" className="text-dark fw-bold text-decoration-none">Đăng ký ngay</Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Login;
