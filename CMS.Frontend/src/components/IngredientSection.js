import React, { useState, useEffect } from 'react';
import ingredientService from '../services/ingredientService';

const fallbackIngredients = [
  {
    title: 'GỖ ĐÀN HƯƠNG: ẤM ÁP MỘC MẠC',
    description: 'Nốt hương trung tâm trầm lắng, nồng nàn được trích xuất tinh khiết từ những thân cây cổ thụ linh thiêng.',
    imageUrl: '/sandalwood.jpg'
  },
  {
    title: 'MUỐI BIỂN: GIÓ ĐẠI DƯƠNG SẢNG KHOÁI',
    description: 'Sự kết hợp trong lành, mát lạnh mang theo nguồn năng lượng tự do tinh khiết của những cơn gió lộng từ khơi xa.',
    imageUrl: '/seasalt.jpg'
  },
  {
    title: 'HỔ PHÁCH: BÍ ẨN HOÀNG GIA',
    description: 'Sự ngọt ngào ấm áp đầy vương giả, tỏa sáng lấp lánh như những tia nắng cuối ngày đọng lại trên làn da.',
    imageUrl: '/amber.jpg'
  }
];

function IngredientSection() {
  const [ingredients, setIngredients] = useState(fallbackIngredients);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const data = await ingredientService.getAllIngredients();
        if (data && Array.isArray(data) && data.length > 0) {
          setIngredients(data);
        }
      } catch (error) {
        console.warn("Lỗi tải nốt hương từ API, sử dụng dữ liệu mặc định.", error);
      }
    };
    fetchIngredients();
  }, []);

  const IMAGE_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL || 'http://localhost:5288';

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/uploads/')) return `${IMAGE_BASE_URL}${url}`;
    return url;
  };

  return (
    <section id="scent-philosophy" className="py-5 bg-white animate-fade-in">
      <div className="container px-4 py-4">
        <div className="row g-5">
          {ingredients.map((ing, idx) => (
            <div key={idx} className="col-lg-4 col-md-6 col-sm-12 text-start">
              {/* 1. Rounded/Borderless Image Block */}
              <div className="ingredient-image-card mb-3">
                <img 
                  src={getImageUrl(ing.imageUrl)} 
                  alt={ing.title} 
                  className="w-100 h-100"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600';
                  }}
                />
              </div>

              {/* 2. Text Content Below Image */}
              <h4 
                className="fw-bold text-charcoal mb-2 font-sans text-uppercase" 
                style={{ fontSize: '1rem', letterSpacing: '0.5px' }}
              >
                {ing.title}
              </h4>
              <p 
                className="text-muted-warm small mb-4" 
                style={{ lineHeight: '1.6', minHeight: '40px', fontSize: '0.85rem' }}
              >
                {ing.description}
              </p>
              
              {/* 3. Luxury Pill Link */}
              <div>
                <a 
                  href="#store-products" 
                  className="btn btn-luxury btn-luxury-outline"
                >
                  KHÁM PHÁ MÙI HƯƠNG
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default IngredientSection;
