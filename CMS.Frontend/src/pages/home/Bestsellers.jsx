import React, { useState, useEffect } from 'react';
import productService from '../../services/productService';
import ProductCard from '../../components/ProductCard';

function Bestsellers() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestsellers = async () => {
      try {
        setLoading(true);
        const data = await productService.getBestsellers();
        setProducts(data);
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm bán chạy:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBestsellers();
  }, []);

  if (loading) return null;
  if (products.length === 0) return null;

  return (
    <section className="py-5 bg-white text-start">
      <div className="container px-4">
        <div className="text-center mb-4">
          <span className="text-uppercase text-muted-warm fw-semibold mb-2 d-block" style={{ fontSize: '0.8rem', letterSpacing: '2px' }}>
            Được yêu thích nhất
          </span>
          <h2 className="fw-bold font-serif" style={{ fontSize: '2rem' }}>SẢN PHẨM BÁN CHẠY</h2>
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

export default Bestsellers;
