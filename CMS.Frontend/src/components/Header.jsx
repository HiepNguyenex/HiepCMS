import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Header() {
  const [searchTerm, setSearchTerm] = useState('');
  const [customer, setCustomer] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();

  const checkAuth = () => {
    const stored = localStorage.getItem('customer');
    if (stored) {
      try {
        setCustomer(JSON.parse(stored));
      } catch (e) {
        setCustomer(null);
      }
    } else {
      setCustomer(null);
    }
  };

  const checkCart = () => {
    const stored = localStorage.getItem('cart');
    if (stored) {
      try {
        const cart = JSON.parse(stored);
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(count);
      } catch (e) {
        setCartCount(0);
      }
    } else {
      setCartCount(0);
    }
  };

  useEffect(() => {
    checkAuth();
    checkCart();
    
    const handleStorageChange = () => {
      checkAuth();
      checkCart();
    };

    let lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
    const handleScroll = () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const isVisible = scrollY < lastScrollY || scrollY < 100;
      setVisible(isVisible);
      lastScrollY = scrollY;
    };

    window.addEventListener('customerAuthChange', checkAuth);
    window.addEventListener('cartChange', checkCart);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('customerAuthChange', checkAuth);
      window.removeEventListener('cartChange', checkCart);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('customer');
    setCustomer(null);
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const event = new CustomEvent('searchPerfume', { detail: searchTerm });
    window.dispatchEvent(event);
    navigate('/');
  };

  return (
    <header 
      className="main-header-wrapper bg-white shadow-sm sticky-top"
      style={{
        transition: 'transform 0.3s ease-in-out',
        transform: visible ? 'translateY(0)' : 'translateY(-100%)'
      }}
    >
      {/* Top Bar */}
      <div className="py-2 px-4 d-none d-md-flex justify-content-between align-items-center bg-light" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', borderBottom: '1px solid rgba(28,30,33,0.05)' }}>
        <div className="d-flex gap-4 text-start">
          <span><i className="bi bi-telephone me-2"></i>Hotline: 090.xxx.xxxx</span>
          <span><i className="bi bi-envelope me-2"></i>Email: support@hiepperfume.vn</span>
        </div>
        <div className="d-flex gap-3 align-items-center">
          {customer ? (
            <>
              <span className="text-charcoal fw-semibold"><i className="bi bi-person-check me-1"></i>Chào, {customer.fullName || customer.FullName}</span>
              <span className="text-muted">|</span>
              <Link to="/profile" className="text-decoration-none text-charcoal fw-semibold">
                <i className="bi bi-person-gear me-1"></i>Tài khoản
              </Link>
              <span className="text-muted">|</span>
              <Link to="/order-history" className="text-decoration-none text-charcoal fw-semibold">
                <i className="bi bi-receipt me-1"></i>Đơn hàng
              </Link>
              <span className="text-muted">|</span>
              <button onClick={handleLogout} className="btn btn-link text-decoration-none text-charcoal p-0 m-0 fw-semibold align-baseline" style={{ fontSize: 'inherit' }}>
                <i className="bi bi-box-arrow-right me-1"></i>Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-decoration-none text-charcoal fw-semibold"><i className="bi bi-person me-1"></i>Đăng nhập</Link>
              <span className="text-muted">|</span>
              <Link to="/register" className="text-decoration-none text-charcoal fw-semibold"><i className="bi bi-person-plus me-1"></i>Đăng ký</Link>
            </>
          )}
        </div>
      </div>

      {/* Main Header */}
      <div className="py-3 px-4 d-flex justify-content-between align-items-center container">
        {/* Logo */}
        <Link to="/" className="text-decoration-none text-charcoal">
          <h2 className="mb-0 fw-bold tracking-tight font-serif text-start" style={{ fontSize: '2rem' }}>
            HiepPerfume<span className="text-muted" style={{ fontSize: '1rem' }}>.Fashion</span>
          </h2>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="d-flex mx-auto col-md-5 col-8">
          <div className="input-group">
            <input
              type="text"
              className="form-control premium-search-input"
              placeholder="Tìm kiếm mùi hương, thương hiệu nước hoa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            />
            <button className="btn premium-search-btn py-2 px-4" type="submit">
              <i className="bi bi-search"></i>
            </button>
          </div>
        </form>

        {/* Cart Icon */}
        <div className="d-flex align-items-center gap-3">
          <Link to="/cart" className="position-relative cursor-pointer text-charcoal">
            <i className="bi bi-bag fs-4"></i>
            {cartCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-dark text-white fw-bold" style={{ fontSize: '0.65rem', padding: '0.25em 0.5em' }}>
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="py-2 bg-white" style={{ borderTop: '1px solid rgba(28,30,33,0.05)' }}>
        <ul className="nav justify-content-center gap-4 text-uppercase fw-semibold" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>
          <li className="nav-item">
            <Link to="/" className="nav-link nav-link-underline py-1 px-2 text-charcoal">Trang Chủ</Link>
          </li>
          <li className="nav-item">
            <Link to="/shop" className="nav-link nav-link-underline py-1 px-2 text-charcoal">Cửa Hàng</Link>
          </li>
          <li className="nav-item">
            <Link to="/blog" className="nav-link nav-link-underline py-1 px-2 text-charcoal">Tin Tức / Blog</Link>
          </li>
          <li className="nav-item">
            <Link to="/about" className="nav-link nav-link-underline py-1 px-2 text-charcoal">Về Chúng Tôi</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
