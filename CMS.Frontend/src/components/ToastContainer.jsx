import React, { useState, useEffect } from 'react';

function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (e) => {
      const { message, type } = e.detail;
      const id = Date.now();
      
      setToasts((prevToasts) => [...prevToasts, { id, message, type, isFadingOut: false }]);

      // Bắt đầu fade out trước khi biến mất
      setTimeout(() => {
        setToasts((prevToasts) =>
          prevToasts.map((t) => (t.id === id ? { ...t, isFadingOut: true } : t))
        );
      }, 3200);

      // Xóa hoàn toàn khỏi DOM
      setTimeout(() => {
        setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
      }, 3500);
    };

    window.addEventListener('show-toast', handleToast);
    return () => {
      window.removeEventListener('show-toast', handleToast);
    };
  }, []);

  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
  };

  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return <i className="bi bi-check-circle-fill text-success fs-5"></i>;
      case 'error':
        return <i className="bi bi-x-circle-fill text-danger fs-5"></i>;
      case 'warning':
        return <i className="bi bi-exclamation-triangle-fill text-warning fs-5"></i>;
      case 'info':
      default:
        return <i className="bi bi-info-circle-fill text-info fs-5"></i>;
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'success': return '#28a745';
      case 'error': return '#dc3545';
      case 'warning': return '#ffc107';
      case 'info':
      default:
        return '#17a2b8';
    }
  };

  return (
    <>
      <style>{`
        .toast-wrapper {
          position: fixed;
          top: 25px;
          right: 25px;
          z-index: 999999;
          display: flex;
          flex-direction: column;
          gap: 12px;
          pointer-events: none;
        }
        .toast-item {
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: 15px;
          min-width: 320px;
          max-width: 420px;
          padding: 16px 20px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.02);
          border-radius: 12px;
          font-family: 'Inter', sans-serif;
          animation: toastSlideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          transition: all 0.3s ease;
        }
        .toast-item.fade-out {
          animation: toastSlideOut 0.3s ease forwards;
        }
        .toast-content {
          flex-grow: 1;
          color: #333333;
          font-size: 0.88rem;
          font-weight: 500;
          line-height: 1.4;
          text-align: left;
        }
        .toast-close-btn {
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s ease;
        }
        .toast-close-btn:hover {
          color: #333;
        }
        @keyframes toastSlideIn {
          from {
            transform: translateY(-20px) scale(0.9);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        @keyframes toastSlideOut {
          from {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          to {
            transform: translateX(120%);
            opacity: 0;
          }
        }
      `}</style>

      <div className="toast-wrapper">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast-item ${toast.isFadingOut ? 'fade-out' : ''}`}
            style={{ borderLeft: `5px solid ${getBorderColor(toast.type)}` }}
          >
            <div className="d-flex align-items-center flex-shrink-0">
              {getToastIcon(toast.type)}
            </div>
            <div className="toast-content">
              {toast.message}
            </div>
            <button className="toast-close-btn" onClick={() => removeToast(toast.id)}>
              <i className="bi bi-x-lg" style={{ fontSize: '0.8rem' }}></i>
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

export default ToastContainer;
