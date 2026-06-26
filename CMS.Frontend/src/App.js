import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home/index';
import ProductDetail from './pages/product-detail/index';
import Shop from './pages/shop/index';
import Blog from './pages/blog/index';
import BlogDetail from './pages/blog-detail/index';
import Cart from './pages/cart/index';
import Checkout from './pages/checkout/index';
import CheckoutSuccess from './pages/checkout-success/index';
import Login from './pages/login/index';
import Register from './pages/register/index';
import About from './pages/about/index';
import OrderHistory from './pages/order-history/index';
import Profile from './pages/profile/index';
import ToastContainer from './components/ToastContainer';

function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100 bg-light">
        <ToastContainer />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout-success" element={<CheckoutSuccess />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
            <Route path="/order-history" element={<OrderHistory />} />
            <Route path="/profile" element={<Profile />} />
            
            {/* Lỗi 404 */}
            <Route path="*" element={
              <div className="container text-center py-5 my-5">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/580/580185.png"
                  alt="404"
                  className="mb-4"
                  style={{ width: '100px', opacity: 0.6 }}
                />
                <h2 className="fw-bold text-secondary">404 - KHÔNG TÌM THẤY TRANG</h2>
                <p className="text-muted">Đường dẫn bạn truy cập không tồn tại trên hệ thống.</p>
                <a href="/" className="btn btn-dark btn-sm mt-2">Quay lại Trang Chủ</a>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
