import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import customerService from '../../services/customerService';

function Profile() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [customer, setCustomer] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCustomer = localStorage.getItem('customer');
    if (!storedCustomer) {
      setLoading(false);
      return;
    }

    const parsedCustomer = JSON.parse(storedCustomer);
    setCustomer(parsedCustomer);

    const fetchCustomerProfile = async () => {
      try {
        setLoading(true);
        const customerId = parsedCustomer.id || parsedCustomer.Id;
        const data = await customerService.getCustomerById(customerId);
        
        setFormData({
          fullName: data.fullName || data.FullName || '',
          email: data.email || data.Email || '',
          phone: data.phone || data.Phone || '',
          address: data.address || data.Address || '',
          password: '',
          confirmPassword: ''
        });
        setError('');
      } catch (err) {
        console.error("Lỗi khi tải thông tin cá nhân:", err);
        setError("Không thể tải thông tin cá nhân của bạn.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerProfile();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Valdate password if entered
    if (formData.password) {
      if (formData.password.length < 6) {
        setError('Mật khẩu mới phải có tối thiểu 6 ký tự.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Mật khẩu xác nhận không trùng khớp.');
        return;
      }
    }

    setSaving(true);

    try {
      const customerId = customer.id || customer.Id;
      const payload = {
        id: customerId,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        password: formData.password || null
      };

      await customerService.updateCustomer(customerId, payload);
      
      // Update local storage
      const updatedCustomer = {
        id: customerId,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address
      };
      localStorage.setItem('customer', JSON.stringify(updatedCustomer));
      
      // Dispatch custom event to notify Header
      window.dispatchEvent(new Event('customerAuthChange'));
      
      setSuccess('Cập nhật thông tin cá nhân thành công!');
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Không thể cập nhật thông tin cá nhân. Vui lòng thử lại.';
      setError(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('customer');
    window.dispatchEvent(new Event('customerAuthChange'));
    navigate('/');
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container py-5 text-center min-vh-100 d-flex flex-column justify-content-center align-items-center" style={{ backgroundColor: '#F8F7F4' }}>
          <div className="spinner-border text-dark mb-3" role="status"></div>
          <p className="text-muted-warm small">Đang tải thông tin cá nhân của bạn...</p>
        </div>
        <Footer />
      </>
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
              <li className="breadcrumb-item active text-muted-warm" aria-current="page" style={{ fontWeight: '600' }}>Tài khoản cá nhân</li>
            </ol>
          </nav>
          <h2 className="fw-bold font-serif mb-0 text-charcoal">TÀI KHOẢN CỦA TÔI</h2>
        </div>
      </div>

      {/* Main Content */}
      <div className="container flex-grow-1 py-5 px-4 text-start">
        {!customer ? (
          <div className="text-center py-5 bg-white shadow-sm p-4 col-12 col-md-8 mx-auto" style={{ borderRadius: '16px' }}>
            <i className="bi bi-lock-fill fs-1 text-muted-warm d-block mb-3"></i>
            <h4 className="fw-bold font-serif text-charcoal mb-2">YÊU CẦU ĐĂNG NHẬP</h4>
            <p className="text-muted-warm small mb-4">Bạn cần đăng nhập tài khoản khách hàng để truy cập trang cá nhân.</p>
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
          <div className="row g-4">
            {/* Left Sidebar Card */}
            <div className="col-12 col-md-4">
              <div className="card border-0 shadow-sm p-4 text-center bg-white h-100" style={{ borderRadius: '16px' }}>
                <div className="position-relative d-inline-block mx-auto mb-3">
                  <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: '100px', height: '100px', border: '2px solid #EAE6DF' }}>
                    <i className="bi bi-person-fill text-muted-warm" style={{ fontSize: '3rem' }}></i>
                  </div>
                </div>
                <h5 className="fw-bold font-serif text-charcoal mb-1">{formData.fullName}</h5>
                <p className="text-muted-warm small mb-4">{formData.email}</p>

                <hr className="my-4 text-muted-warm" style={{ opacity: 0.15 }} />

                <div className="d-flex flex-column gap-2 text-start">
                  <Link to="/order-history" className="btn btn-light text-start py-2.5 px-3 rounded-3 d-flex align-items-center justify-content-between text-decoration-none text-charcoal">
                    <span className="small fw-semibold"><i className="bi bi-receipt me-2"></i> Lịch sử đơn hàng</span>
                    <i className="bi bi-chevron-right text-muted small"></i>
                  </Link>
                  
                  <button onClick={handleLogout} className="btn btn-outline-danger text-start py-2.5 px-3 rounded-3 d-flex align-items-center justify-content-between">
                    <span className="small fw-semibold"><i className="bi bi-box-arrow-right me-2"></i> Đăng xuất tài khoản</span>
                    <i className="bi bi-chevron-right text-danger small"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Form Card */}
            <div className="col-12 col-md-8">
              <div className="card border-0 shadow-sm p-4 bg-white" style={{ borderRadius: '16px' }}>
                <h5 className="fw-bold font-serif text-charcoal mb-4 pb-2 border-bottom">
                  CẬP NHẬT THÔNG TIN CÁ NHÂN
                </h5>

                {error && (
                  <div className="alert alert-danger py-2.5 text-start mb-4" role="alert" style={{ fontSize: '0.85rem' }}>
                    <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
                  </div>
                )}

                {success && (
                  <div className="alert alert-success py-2.5 text-start mb-4" role="alert" style={{ fontSize: '0.85rem' }}>
                    <i className="bi bi-check-circle-fill me-2"></i> {success}
                  </div>
                )}

                <form onSubmit={handleUpdateProfile}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-semibold text-secondary">Họ và Tên *</label>
                      <input
                        type="text"
                        name="fullName"
                        className="form-control"
                        placeholder="Nhập họ và tên"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        style={{ borderRadius: '8px' }}
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-semibold text-secondary">Địa chỉ Email *</label>
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        placeholder="Nhập email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        style={{ borderRadius: '8px' }}
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
                        placeholder="Nhập số điện thoại"
                        value={formData.phone}
                        onChange={handleInputChange}
                        style={{ borderRadius: '8px' }}
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-semibold text-secondary">Địa chỉ nhận hàng</label>
                      <input
                        type="text"
                        name="address"
                        className="form-control"
                        placeholder="Số nhà, Tên đường, Quận, Thành phố"
                        value={formData.address}
                        onChange={handleInputChange}
                        style={{ borderRadius: '8px' }}
                      />
                    </div>
                  </div>

                  <hr className="my-4 text-muted-warm" style={{ opacity: 0.15 }} />

                  <h6 className="fw-bold text-charcoal font-serif mb-3">THAY ĐỔI MẬT KHẨU (TÙY CHỌN)</h6>
                  <p className="text-muted-warm small mb-3">Để trống nếu bạn không có nhu cầu thay đổi mật khẩu đăng nhập.</p>

                  <div className="row">
                    <div className="col-md-6 mb-4">
                      <label className="form-label small fw-semibold text-secondary">Mật khẩu mới</label>
                      <input
                        type="password"
                        name="password"
                        className="form-control"
                        placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                        value={formData.password}
                        onChange={handleInputChange}
                        style={{ borderRadius: '8px' }}
                      />
                    </div>

                    <div className="col-md-6 mb-4">
                      <label className="form-label small fw-semibold text-secondary">Xác nhận mật khẩu mới</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        className="form-control"
                        placeholder="Nhập lại mật khẩu mới"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        style={{ borderRadius: '8px' }}
                      />
                    </div>
                  </div>

                  <div className="d-flex justify-content-end">
                    <button
                      type="submit"
                      className="btn btn-dark px-5 py-2.5 rounded-pill fw-bold text-uppercase"
                      style={{ fontSize: '0.85rem', letterSpacing: '1px' }}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          ĐANG LƯU...
                        </>
                      ) : (
                        'LƯU THAY ĐỔI'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Profile;
