import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import productService from '../../services/productService';
import ProductCard from '../../components/ProductCard';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedVolume, setSelectedVolume] = useState('100ml');
  const [activeTab, setActiveTab] = useState('notes');

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getProductNotes = (name) => {
    if (!name) return {};
    const normalized = name.toLowerCase();
    if (normalized.includes('bleu de chanel')) {
      return {
        origin: 'Pháp', concentration: 'Parfum', scentGroup: 'Hương gỗ thơm (Woody Aromatic)',
        topNotes: 'Bưởi chùm, Cam Bergamot, Bạc hà, Ngải cứu',
        heartNotes: 'Oải hương, Phong lữ, Quả dứa (Thơm), Nốt hương xanh',
        baseNotes: 'Gỗ tuyết tùng, Gỗ đàn hương, Đậu Tonka, Nhựa hổ phách',
        longevity: 'Lâu - 8 đến 12 giờ', projection: 'Gần - Trong vòng một cánh tay'
      };
    }
    if (normalized.includes('sauvage')) {
      return {
        origin: 'Pháp', concentration: 'Eau de Parfum (EDP)', scentGroup: 'Hương dương xỉ phương đông (Oriental Fougere)',
        topNotes: 'Cam Bergamot Calabria, Tiêu đen',
        heartNotes: 'Oải hương, Nhục đậu khấu, Tiêu Tứ Xuyên, Cỏ hương bài',
        baseNotes: 'Nhựa Ambroxan, Vani Papua New Guinea',
        longevity: 'Rất lâu - Trên 12 giờ', projection: 'Xa - Toả hương trong vòng bán kính 2 mét'
      };
    }
    return {
      origin: 'Nhập khẩu chính hãng', concentration: 'Eau de Parfum (EDP)', scentGroup: 'Hương hoa cỏ & Gỗ ấm',
      topNotes: 'Cam quýt ngọt ngào, Bạc hà tươi mát',
      heartNotes: 'Hoa nhài trắng, Nhục đậu khấu ấm nồng',
      baseNotes: 'Gỗ đàn hương, Xạ hương ấm áp, Hổ phách quyến rũ',
      longevity: 'Khá tốt - 6 đến 8 giờ', projection: 'Vừa phải - Trong vòng một cánh tay'
    };
  };

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      try {
        setLoading(true);
        const currentProd = await productService.getProductById(id);
        setProduct(currentProd);

        if (currentProd.name && currentProd.name.toLowerCase().includes('chiết')) {
          setSelectedVolume('10ml');
        } else {
          setSelectedVolume('100ml');
        }

        const allProducts = await productService.getAllProducts();
        const filtered = allProducts.filter(
          (p) => p.categoryProductId === currentProd.categoryProductId && p.id !== currentProd.id
        );
        setRelatedProducts(filtered.slice(0, 4));
        setError(null);
      } catch (err) {
        console.error('Lỗi tải chi tiết sản phẩm:', err);
        setError('Không thể tải thông tin sản phẩm này.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndRelated();
    window.scrollTo(0, 0);
    setQuantity(1);
  }, [id]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="container py-5 text-center min-vh-100 d-flex flex-column justify-content-center align-items-center">
          <div className="spinner-border text-dark mb-3" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="text-muted-warm">Đang tải câu chuyện hương nước hoa...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Header />
        <div className="container py-5 text-center min-vh-100 d-flex flex-column justify-content-center align-items-center">
          <i className="bi bi-exclamation-octagon text-danger fs-1 mb-3"></i>
          <h3 className="font-serif fw-bold">Đã xảy ra lỗi</h3>
          <p className="text-muted-warm">{error || 'Không tìm thấy sản phẩm.'}</p>
          <Link to="/" className="btn btn-dark px-4 py-2 mt-3">Quay lại trang chủ</Link>
        </div>
        <Footer />
      </>
    );
  }

  const notes = getProductNotes(product.name);
  const isChiet = product.name.toLowerCase().includes('chiết');
  
  const getDynamicPrice = () => {
    if (isChiet) {
      if (selectedVolume === '10ml') return product.price;
      if (selectedVolume === '20ml') return product.price * 1.8;
      if (selectedVolume === '2ml (Mẫu thử)') return product.price * 0.25;
    } else {
      if (selectedVolume === '100ml') return product.price;
      if (selectedVolume === '50ml') return product.price * 0.65;
      if (selectedVolume === '10ml (Chiết)') return product.price * 0.2;
    }
    return product.price;
  };

  const handleAddToCart = () => {
    if (product.stockQuantity === 0) {
      alert("Sản phẩm đã hết hàng!");
      return;
    }
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(x => x.id === product.id && x.volume === selectedVolume);
    const calculatedPrice = getDynamicPrice();
    if (existing) {
      if (existing.quantity + quantity > product.stockQuantity) {
        alert(`Không thể mua thêm. Tổng số lượng trong giỏ hàng vượt quá giới hạn tồn kho (${product.stockQuantity} chai).`);
        return;
      }
      existing.quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: calculatedPrice,
        imageUrl: product.imageUrl,
        volume: selectedVolume,
        quantity: quantity,
        stockQuantity: product.stockQuantity,
        categoryProductName: product.categoryProductName
      });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartChange'));
    alert(`Đã thêm ${quantity} chai [${product.name}] (${selectedVolume}) vào giỏ hàng!`);
  };

  return (
    <>
      <Header />
      <div className="product-detail-page animate-fade-in" style={{ backgroundColor: '#F8F7F4', minHeight: '100vh' }}>
        {/* Breadcrumb */}
        <div className="py-3 bg-white" style={{ borderBottom: '1px solid rgba(28, 30, 33, 0.05)' }}>
          <div className="container px-4">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0 text-uppercase small" style={{ letterSpacing: '1px' }}>
                <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-charcoal">Trang chủ</Link></li>
                <li className="breadcrumb-item"><a href="/#store-products" className="text-decoration-none text-charcoal">Nước hoa</a></li>
                <li className="breadcrumb-item active text-muted-warm" aria-current="page" style={{ fontWeight: '600' }}>{product.name}</li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Content */}
        <section className="py-5">
          <div className="container px-4 bg-white p-4 p-md-5" style={{ borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.02)' }}>
            <div className="row g-5">
              <div className="col-lg-6">
                <div className="d-flex align-items-center justify-content-center p-4" style={{ backgroundColor: '#F7F6F3', borderRadius: '12px', height: '450px', position: 'relative' }}>
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="img-fluid object-fit-contain h-100" 
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600'; }}
                  />
                </div>
              </div>

              <div className="col-lg-6 d-flex flex-column justify-content-between text-start">
                <div>
                  <span className="text-uppercase text-muted-warm fw-semibold d-block mb-2" style={{ fontSize: '0.8rem', letterSpacing: '2px' }}>{product.categoryProductName || 'Nước hoa'}</span>
                  <h1 className="font-serif fw-bold text-charcoal mb-3" style={{ fontSize: '2.5rem', lineHeight: '1.2' }}>{product.name}</h1>
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <h3 className="fw-bold text-charcoal mb-0" style={{ fontSize: '1.8rem' }}>{formatPrice(getDynamicPrice())}</h3>
                    <span className="badge bg-light text-charcoal border-0 rounded-pill px-3 py-1.5 text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>
                      {product.stockQuantity > 0 ? `Còn hàng (${product.stockQuantity})` : 'Hết hàng'}
                    </span>
                  </div>
                  <p className="text-muted-warm mb-4" style={{ fontSize: '1rem', lineHeight: '1.8' }}>{product.description}</p>
                  
                  {/* Volume selection */}
                  <div className="mb-4">
                    <span className="text-uppercase fw-semibold text-charcoal d-block mb-3" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>DUNG TÍCH:</span>
                    <div className="d-flex flex-wrap gap-2">
                      {isChiet ? (
                        ['2ml (Mẫu thử)', '10ml', '20ml'].map((vol) => (
                          <button key={vol} onClick={() => setSelectedVolume(vol)} className={`btn btn-sm ${selectedVolume === vol ? 'btn-dark' : 'btn-light'} px-3 py-2`} style={{ borderRadius: '20px', fontSize: '0.8rem' }}>{vol}</button>
                        ))
                      ) : (
                        ['10ml (Chiết)', '50ml', '100ml'].map((vol) => (
                          <button key={vol} onClick={() => setSelectedVolume(vol)} className={`btn btn-sm ${selectedVolume === vol ? 'btn-dark' : 'btn-light'} px-3 py-2`} style={{ borderRadius: '20px', fontSize: '0.8rem' }}>{vol}</button>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Quantity and Add to Cart */}
                  <div className="row g-3 align-items-center mb-4">
                    <div className="col-sm-4 col-12">
                      <span className="text-uppercase fw-semibold text-charcoal d-block mb-2" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>SỐ LƯỢNG:</span>
                      <div className="input-group" style={{ border: '1px solid rgba(0,0,0,0.15)', borderRadius: '30px', overflow: 'hidden' }}>
                        <button className="btn btn-light bg-white border-0 py-2 px-3 text-charcoal" type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={product.stockQuantity === 0}>
                          <i className="bi bi-dash-lg"></i>
                        </button>
                        <input type="text" className="form-control text-center bg-white border-0 fw-bold py-2" value={quantity} readOnly />
                        <button className="btn btn-light bg-white border-0 py-2 px-3 text-charcoal" type="button" onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))} disabled={product.stockQuantity === 0}>
                          <i className="bi bi-plus-lg"></i>
                        </button>
                      </div>
                    </div>
                    
                    <div className="col-sm-8 col-12 pt-sm-4">
                      <button onClick={handleAddToCart} className="btn btn-dark w-100 py-3 d-flex align-items-center justify-content-center gap-2" disabled={product.stockQuantity === 0} style={{ borderRadius: '30px', fontSize: '0.85rem', fontWeight: '700' }}>
                        <i className="bi bi-bag-plus-fill fs-5"></i> THÊM VÀO GIỎ HÀNG
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="mt-4">
                  <ul className="nav nav-tabs border-0 mb-3 gap-2" role="tablist">
                    <li><button className={`nav-link text-uppercase border-0 px-4 py-2 fw-semibold small ${activeTab === 'notes' ? 'active bg-dark text-white' : 'text-muted bg-light'}`} style={{ borderRadius: '30px' }} onClick={() => setActiveTab('notes')}>Nốt Hương</button></li>
                    <li><button className={`nav-link text-uppercase border-0 px-4 py-2 fw-semibold small ${activeTab === 'specs' ? 'active bg-dark text-white' : 'text-muted bg-light'}`} style={{ borderRadius: '30px' }} onClick={() => setActiveTab('specs')}>Thông Số</button></li>
                  </ul>
                  <div className="tab-content py-2">
                    {activeTab === 'notes' && (
                      <div className="row g-3">
                        <div className="col-12"><strong className="small text-uppercase d-block mb-1">Hương Đầu:</strong><span className="text-muted-warm small">{notes.topNotes}</span></div>
                        <div className="col-12 border-top border-light pt-2"><strong className="small text-uppercase d-block mb-1">Hương Giữa:</strong><span className="text-muted-warm small">{notes.heartNotes}</span></div>
                        <div className="col-12 border-top border-light pt-2"><strong className="small text-uppercase d-block mb-1">Hương Cuối:</strong><span className="text-muted-warm small">{notes.baseNotes}</span></div>
                      </div>
                    )}
                    {activeTab === 'specs' && (
                      <table className="table table-sm table-borderless text-muted-warm small">
                        <tbody>
                          <tr><td className="fw-semibold text-charcoal py-1 ps-0" style={{ width: '40%' }}>Xuất xứ:</td><td className="py-1">{notes.origin}</td></tr>
                          <tr className="border-top border-light"><td className="fw-semibold text-charcoal py-1 ps-0">Nồng độ:</td><td className="py-1">{notes.concentration}</td></tr>
                          <tr className="border-top border-light"><td className="fw-semibold text-charcoal py-1 ps-0">Độ lưu hương:</td><td className="py-1">{notes.longevity}</td></tr>
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="py-5" style={{ backgroundColor: '#F8F7F4' }}>
            <div className="container px-4">
              <h2 className="fw-bold font-serif text-center mb-5" style={{ fontSize: '2rem' }}>SẢN PHẨM CÙNG DANH MỤC</h2>
              <div className="row g-4">
                {relatedProducts.map((prod) => (
                  <div key={prod.id} className="col-lg-3 col-md-6">
                    <ProductCard item={prod} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
      <Footer />
    </>
  );
}

export default ProductDetail;
