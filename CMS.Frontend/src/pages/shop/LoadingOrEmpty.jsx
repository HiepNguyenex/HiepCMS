import React from 'react';

function LoadingOrEmpty({ loading, error, isEmpty }) {
  if (loading) {
    return (
      <div className="text-center py-5 my-5">
        <div className="spinner-border text-dark mb-2" role="status"></div>
        <p className="text-muted-warm small">Đang tìm kiếm mùi hương của bạn...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-warning text-center my-4" role="alert">
        <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="text-center py-5 my-5">
        <img
          src="https://cdn-icons-png.flaticon.com/512/3067/3067416.png"
          alt="Không tìm thấy sản phẩm"
          className="mb-4"
          style={{ width: '80px', opacity: 0.4 }}
        />
        <h4 className="fw-bold font-serif text-secondary mb-2">KHÔNG TÌM THẤY KẾT QUẢ</h4>
        <p className="text-muted small">Không tìm thấy sản phẩm nào phù hợp với tiêu chí của bạn.</p>
      </div>
    );
  }

  return null;
}

export default LoadingOrEmpty;
