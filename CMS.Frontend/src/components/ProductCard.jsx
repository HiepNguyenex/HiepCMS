import React from 'react';
import { Link } from 'react-router-dom';
import { toast } from '../utils/toast';

function ProductCard({ item }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const handleAddToCart = () => {
    if (item.stockQuantity === 0) {
      toast.warning("Sản phẩm đã hết hàng!");
      return;
    }
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const defaultVolume = item.name.toLowerCase().includes('chiết') ? '10ml' : '100ml';
    const existing = cart.find(x => x.id === item.id && x.volume === defaultVolume);
    if (existing) {
      if (existing.quantity >= item.stockQuantity) {
        toast.warning(`Không thể mua thêm. Số lượng trong giỏ hàng đã đạt giới hạn tồn kho (${item.stockQuantity} chai).`);
        return;
      }
      existing.quantity += 1;
    } else {
      cart.push({
        id: item.id,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
        volume: defaultVolume,
        quantity: 1,
        stockQuantity: item.stockQuantity,
        categoryProductName: item.categoryProductName
      });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartChange'));
    toast.success(`Đã thêm nước hoa [${item.name}] vào giỏ hàng!`);
  };

  return (
    <div className="card h-100 product-card premium-card" style={{ borderRadius: '12px', overflow: 'hidden', transition: '0.3s' }}>
      <div className="position-relative overflow-hidden" style={{ height: '320px', backgroundColor: '#F7F6F3' }}>
        <img 
          src={item.imageUrl}
          className="card-img-top w-100 h-100 object-fit-contain p-3" 
          alt={item.name}
          style={{ transition: 'transform 0.5s' }}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600';
          }}
        />
        
        {item.stockQuantity <= 5 && item.stockQuantity > 0 && (
          <span className="badge bg-danger position-absolute px-2.5 py-1.5" style={{ top: '15px', left: '15px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>
            SẮP HẾT HÀNG / CÒN {item.stockQuantity} CHAI
          </span>
        )}
        {item.stockQuantity === 0 && (
          <span className="badge bg-secondary position-absolute px-2.5 py-1.5" style={{ top: '15px', left: '15px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>
            HẾT HÀNG
          </span>
        )}
      </div>

      <div className="card-body d-flex flex-column p-3 text-start">
        <span className="text-uppercase text-muted-warm fw-semibold mb-1" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>
          {item.categoryProductName || 'Nước hoa'}
        </span>
        <h6 className="card-title fw-bold text-charcoal text-truncate-2-lines mb-2" title={item.name} style={{ fontSize: '1rem', minHeight: '40px', lineHeight: '1.3' }}>
          {item.name}
        </h6>
        
        <p className="card-text fw-bold text-charcoal mb-3" style={{ fontSize: '1.1rem' }}>
          {formatCurrency(item.price)}
        </p>

        <div className="mt-auto pt-2 border-top d-flex justify-content-between gap-2">
          <Link 
            to={`/product/${item.id}`} 
            className="btn btn-sm btn-outline-dark px-3 py-1.5 flex-grow-1 font-sans" 
            style={{ borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}
          >
            CHI TIẾT
          </Link>
          <button 
            className="btn btn-sm btn-dark text-white px-3 py-1.5 flex-grow-1 font-sans" 
            style={{ borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}
            disabled={item.stockQuantity === 0}
            onClick={handleAddToCart}
          >
            MUA NGAY
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
