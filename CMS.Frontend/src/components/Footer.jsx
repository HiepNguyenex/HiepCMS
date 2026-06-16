import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="main-footer-wrapper bg-dark text-light pt-5 mt-auto">
      <div className="container pb-4">
        <div className="row g-4 text-start">
          {/* Cột 1: Giới thiệu */}
          <div className="col-md-4 mb-4 mb-md-0">
            <h4 className="fw-bold mb-3" style={{ color: '#fff', letterSpacing: '1px' }}>
              HiepPerfume<span className="text-secondary" style={{ fontSize: '1.2rem' }}>.Fashion</span>
            </h4>
            <p className="text-muted-warm" style={{ fontSize: '14px', lineHeight: '1.6', color: '#a0a0a0' }}>
              Hệ thống nước hoa cao cấp dẫn đầu xu hướng. Chúng tôi cam kết mang đến những sản phẩm nước hoa chính hãng cao cấp, định hình phong cách thời thượng và quyến rũ cho bạn.
            </p>
          </div>

          {/* Cột 2: Đường dẫn nhanh */}
          <div className="col-md-4 mb-4 mb-md-0 pl-md-5">
            <h5 className="fw-bold mb-3 text-uppercase border-left pl-2" style={{ borderLeft: '3px solid #6c757d', fontSize: '1rem' }}>
              Chính Sách
            </h5>
            <ul className="list-unstyled" style={{ fontSize: '14px' }}>
              <li className="mb-2">
                <Link to="/policy/delivery" className="text-muted text-decoration-none text-white-50">
                  <i className="bi bi-chevron-right me-1" style={{ fontSize: '10px' }}></i>Chính sách giao hàng
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/policy/exchange" className="text-muted text-decoration-none text-white-50">
                  <i className="bi bi-chevron-right me-1" style={{ fontSize: '10px' }}></i>Chính sách đổi trả 1-1
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/policy/privacy" className="text-muted text-decoration-none text-white-50">
                  <i className="bi bi-chevron-right me-1" style={{ fontSize: '10px' }}></i>Bảo mật thông tin khách hàng
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Liên hệ */}
          <div className="col-md-4">
            <h5 className="fw-bold mb-3 text-uppercase border-left pl-2" style={{ borderLeft: '3px solid #6c757d', fontSize: '1rem' }}>
              Liên Hệ
            </h5>
            <ul className="list-unstyled text-white-50" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <li className="mb-2 d-flex align-items-start gap-2">
                <i className="bi bi-geo-alt mt-1"></i>
                <span>Khu công nghệ cao, Võ Chí Công, Quận 9, TP. Hồ Chí Minh</span>
              </li>
              <li className="mb-2">
                <i className="bi bi-telephone me-2"></i> Hotline: 090.xxx.xxxx
              </li>
              <li className="mb-2">
                <i className="bi bi-envelope me-2"></i> support@hiepperfume.vn
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* copyright */}
      <div className="copyright-bar py-3 mt-4" style={{ backgroundColor: '#1a1a1a', borderTop: '1px solid #2d2d2d' }}>
        <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center small text-white-50">
          <p className="m-0">© {new Date().getFullYear()} <strong>HiepPerfume Store</strong>. All Rights Reserved.</p>
          <p className="m-0 mt-2 mt-md-0">MSSV: 2123110161 - Nguyễn Vũ Hiệp</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
