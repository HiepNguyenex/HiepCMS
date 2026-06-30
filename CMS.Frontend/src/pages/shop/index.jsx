import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ShopSidebar from './ShopSidebar';
import ShopHeader from './ShopHeader';
import ProductList from './ProductList';
import LoadingOrEmpty from './LoadingOrEmpty';
import productService from '../../services/productService';

function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter and sort states
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(5000000);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoading(true);
        const params = {};
        if (selectedCategoryId !== null) {
          params.categoryId = selectedCategoryId;
        }
        if (minPrice > 0) {
          params.minPrice = minPrice;
        }
        if (maxPrice > 0 && maxPrice < 5000000) {
          params.maxPrice = maxPrice;
        }
        if (searchTerm.trim() !== '') {
          params.search = searchTerm;
        }
        const data = await productService.getAllProducts(params);
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm ở trang Shop:", err);
        setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllProducts();
  }, [selectedCategoryId, minPrice, maxPrice, searchTerm]);

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'priceAsc') return a.price - b.price;
    if (sortBy === 'priceDesc') return b.price - a.price;
    return 0; // Default sorting by backend ID order
  });

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: '#F8F7F4' }}>
      <Header />
      
      {/* Page Title */}
      <div className="bg-white py-4 shadow-sm border-bottom text-start">
        <div className="container px-4">
          <nav aria-label="breadcrumb" className="mb-2">
            <ol className="breadcrumb mb-0 text-uppercase small" style={{ letterSpacing: '1px' }}>
              <li className="breadcrumb-item"><a href="/" className="text-decoration-none text-charcoal">Trang chủ</a></li>
              <li className="breadcrumb-item active text-muted-warm" aria-current="page" style={{ fontWeight: '600' }}>Cửa hàng</li>
            </ol>
          </nav>
          <h2 className="fw-bold font-serif mb-0 text-charcoal">CỬA HÀNG HIEPPERFUME</h2>
        </div>
      </div>

      {/* Main Layout */}
      <div className="container flex-grow-1 py-5 px-4">
        <div className="row g-4">
          {/* Left Sidebar */}
          <div className="col-12 col-md-4 col-lg-3">
            <ShopSidebar
              activeCategoryId={selectedCategoryId}
              onCategorySelect={setSelectedCategoryId}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinPriceChange={setMinPrice}
              onMaxPriceChange={setMaxPrice}
            />
          </div>

          {/* Right Product Grid */}
          <div className="col-12 col-md-8 col-lg-9">
            <ShopHeader
              totalItems={sortedProducts.length}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />

            <LoadingOrEmpty
              loading={loading}
              error={error}
              isEmpty={sortedProducts.length === 0}
            />

            {!loading && !error && sortedProducts.length > 0 && (
              <ProductList products={sortedProducts} />
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Shop;
