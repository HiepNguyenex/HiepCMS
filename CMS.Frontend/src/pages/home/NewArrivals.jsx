import React, { useState, useEffect } from 'react';
import productService from '../../services/productService';
import ProductCard from '../../components/ProductCard';

function NewArrivals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewProducts = async () => {
      try {
        setLoading(true);
        // Fetch 3 newest products: sorted by ID descending, pageSize = 3
        const data = await productService.getAllProducts({
          sortBy: 'id',
          isDescending: true,
          page: 1,
          pageSize: 3
        });
        setProducts(data);
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm mới nhất:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNewProducts();
  }, []);

  if (loading) return null;
  if (products.length === 0) return null;

  return (
    <section className="py-5 text-start" style={{ backgroundColor: '#F8F7F4' }}>
      <div className="container px-4">
        <div className="text-center mb-4">
          <span className="text-uppercase text-muted-warm fw-semibold mb-2 d-block" style={{ fontSize: '0.8rem', letterSpacing: '2px' }}>
            Xu hướng mới
          </span>
          <h2 className="fw-bold font-serif" style={{ fontSize: '2rem' }}>SẢN PHẨM MỚI NHẤT</h2>
          <div className="accent-line mx-auto" style={{ width: '40px', height: '2px', backgroundColor: '#1c1e21', marginTop: '10px' }}></div>
        </div>

        <div className="row g-4 justify-content-center">
          {products.map((product) => (
            <div key={product.id} className="col-lg-4 col-md-4 col-sm-6">
              <ProductCard item={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default NewArrivals;
