import React from 'react';

function HeroBanner() {
  return (
    <div className="bg-white">
      {/* 1. Static Banner Image Container */}
      <div className="hero-banner-wrapper">
        {/* Entrance Fog Overlay: dissolves in 1.6s */}
        <div className="hero-fog-overlay"></div>

        {/* Hero Background Image - Volcanic raw essence */}
        <img
          src="/hero_volcanic.jpg"
          alt="HiepPerfume - The Volcanic Essence"
          className="hero-banner-img"
        />
      </div>

      {/* 2. Editorial Text & CTA Block Below Image */}
      <div className="py-5 px-4 text-center">
        <div className="container reveal-text-delayed" style={{ maxWidth: '800px' }}>
          <h1 
            className="fw-bold text-charcoal mb-3 font-sans text-uppercase" 
            style={{ fontSize: '2rem', letterSpacing: '2.5px' }}
          >
            NHỊP ĐẬP HÀNG TRIỆU NĂM.
          </h1>
          <p 
            className="text-muted-warm mb-4" 
            style={{ fontSize: '1rem', fontWeight: '400', letterSpacing: '0.5px', lineHeight: '1.7' }}
          >
            Hương thơm thô ráp, mãnh liệt lấy cảm hứng từ những vùng đất núi lửa nguyên thủy.
          </p>
          <div className="pt-2">
            <a 
              href="#store-products" 
              className="btn btn-luxury btn-luxury-solid px-5 py-3"
            >
              KHÁM PHÁ MÙI HƯƠNG
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroBanner;
