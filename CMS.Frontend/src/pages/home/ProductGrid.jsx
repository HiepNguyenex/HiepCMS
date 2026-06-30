import React, { useState, useEffect } from 'react';
import productService from '../../services/productService';
import ProductCard from '../../components/ProductCard';

function ProductGrid({ selectedCategoryId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = {};
        if (selectedCategoryId !== null) {
          params.categoryId = selectedCategoryId;
        }
        if (searchTerm.trim() !== '') {
          params.search = searchTerm;
        }
        const data = await productService.getAllProducts(params);
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error("Lỗi khi tải danh sách nước hoa:", err);
        setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategoryId, searchTerm]);

  useEffect(() => {
    const handleSearch = (e) => {
      setSearchTerm(e.detail || '');
    };
    window.addEventListener('searchPerfume', handleSearch);
    return () => {
      window.removeEventListener('searchPerfume', handleSearch);
    };
  }, []);

  return (
    <section id="store-products" className="py-5 bg-white text-start">
      <div className="container px-4">
        <div className="text-center mb-4">
          <span className="text-uppercase text-muted-warm fw-semibold mb-2 d-block" style={{ fontSize: '0.8rem', letterSpacing: '2px' }}>
            Bộ sưu tập đặc biệt
          </span>
          <h2 className="fw-bold font-serif" style={{ fontSize: '2.2rem' }}>SẢN PHẨM NỔI BẬT</h2>
          <p className="text-muted-warm small mt-1">
            Hiển thị [{products.length}] sản phẩm nước hoa cao cấp
          </p>
          <div className="accent-line"></div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-dark" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="mt-2 text-muted-warm">Đang tải nước hoa...</p>
          </div>
        ) : error ? (
          <div className="alert alert-warning text-center my-4" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i> {error}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-5">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3067/3067416.png"
              alt="Không tìm thấy sản phẩm"
              className="mb-4"
              style={{ width: '80px', opacity: 0.4 }}
            />
            <h4 className="fw-bold font-serif text-secondary mb-2">KHÔNG TÌM THẤY KẾT QUẢ</h4>
            <p className="text-muted-warm text-center">Không tìm thấy sản phẩm nào phù hợp với tiêu chí của bạn.</p>
          </div>
        ) : (
          <div className="row g-4">
            {products.map((product) => (
              <div key={product.id} className="col-lg-3 col-md-4 col-sm-6">
                <ProductCard item={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default ProductGrid;
