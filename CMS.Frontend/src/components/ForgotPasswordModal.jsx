import React, { useState } from 'react';

function ForgotPasswordModal({ show, onClose, onSubmit }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      await onSubmit(email);
      setMessage('Mật khẩu mới đã được gửi tới email của bạn. Vui lòng kiểm tra hộp thư (bao gồm cả thư rác/spam).');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content border-0 shadow" style={{ borderRadius: '15px' }}>
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold text-charcoal font-serif">Quên mật khẩu</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose} 
              aria-label="Close"
              disabled={loading}
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body py-4 text-start">
              {message && (
                <div className="alert alert-success py-2" role="alert" style={{ fontSize: '0.85rem' }}>
                  <i className="bi bi-check-circle me-2"></i> {message}
                </div>
              )}
              {error && (
                <div className="alert alert-danger py-2" role="alert" style={{ fontSize: '0.85rem' }}>
                  <i className="bi bi-exclamation-triangle me-2"></i> {error}
                </div>
              )}
              
              <p className="text-muted small mb-3">
                Nhập email tài khoản của bạn. Hệ thống sẽ sinh ngẫu nhiên một mật khẩu mới gồm 6 chữ số và gửi qua email của bạn.
              </p>
              
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Email đăng ký</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="username@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <div className="modal-footer border-0 pt-0">
              <button 
                type="button" 
                className="btn btn-light" 
                onClick={onClose} 
                disabled={loading} 
                style={{ borderRadius: '20px', fontSize: '0.9rem' }}
              >
                Đóng
              </button>
              <button 
                type="submit" 
                className="btn btn-dark px-4" 
                disabled={loading} 
                style={{ borderRadius: '20px', fontSize: '0.9rem' }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Đang gửi...
                  </>
                ) : (
                  'Gửi mật khẩu mới'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordModal;
