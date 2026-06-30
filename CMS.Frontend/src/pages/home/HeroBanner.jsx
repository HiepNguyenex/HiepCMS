import React, { useState, useEffect, useCallback } from 'react';

const slides = [
  {
    image: '/hero_volcanic.jpg',
    title: 'NHỊP ĐẬP HÀNG TRIỆU NĂM.',
    subtitle: 'Hương thơm thô ráp, mãnh liệt lấy cảm hứng từ những vùng đất núi lửa nguyên thủy.',
    cta: 'KHÁM PHÁ MÙI HƯƠNG',
    link: '#store-products'
  },
  {
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1600&q=80',
    title: 'BỘ SƯU TẬP NƯỚC HOA MỚI',
    subtitle: 'Những chai nước hoa phiên bản giới hạn với thiết kế sang trọng, đẳng cấp.',
    cta: 'XEM NGAY',
    link: '/shop'
  },
  {
    image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=1600&q=80',
    title: 'GIẢM GIÁ MÙA HÈ LÊN ĐẾN 30%',
    subtitle: 'Cơ hội sở hữu những mùi hương đẳng cấp với ưu đãi cực kỳ hấp dẫn, có hạn.',
    cta: 'MUA NGAY',
    link: '/shop'
  }
];

function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToSlide = useCallback((index) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 600);
  }, [isTransitioning]);

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % slides.length);
  }, [currentSlide, goToSlide]);

  // Auto-slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const slide = slides[currentSlide];

  return (
    <div className="bg-white">
      {/* Carousel Banner */}
      <div className="hero-carousel-wrapper">
        {/* Slides */}
        <div className="hero-carousel-track">
          <div className="hero-banner-wrapper">
            {/* Fog overlay entrance effect */}
            <div className="hero-fog-overlay"></div>

            {/* Background Image */}
            <img
              src={slide.image}
              alt={slide.title}
              className="hero-banner-img hero-slide-in"
              key={currentSlide}
            />
          </div>
        </div>

        {/* Text Overlay on Banner */}
        <div className="hero-overlay-content">
          <div className="container px-4">
            <div className="row">
              <div className="col-lg-7 text-start">
                <p className="hero-slide-tag text-uppercase mb-2" key={`tag-${currentSlide}`}>
                  <span className="badge bg-light text-dark px-3 py-2 rounded-pill">
                    <i className="bi bi-star-fill text-warning me-1"></i> HiepPerfume Exclusive
                  </span>
                </p>
                <h1
                  className="fw-bold text-white mb-3 font-sans text-uppercase hero-slide-title"
                  key={`title-${currentSlide}`}
                  style={{ fontSize: 'clamp(1.8rem, 4vw, 3.2rem)', letterSpacing: '3px', textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
                >
                  {slide.title}
                </h1>
                <p
                  className="text-white-50 mb-4 hero-slide-subtitle"
                  key={`sub-${currentSlide}`}
                  style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)', maxWidth: '600px', lineHeight: '1.7', textShadow: '0 1px 10px rgba(0,0,0,0.4)' }}
                >
                  {slide.subtitle}
                </p>
                <div className="pt-2 hero-slide-cta" key={`cta-${currentSlide}`}>
                  <a
                    href={slide.link}
                    className="btn btn-luxury btn-luxury-solid px-5 py-3"
                  >
                    {slide.cta} <i className="bi bi-arrow-right ms-2"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gradient overlay for readability */}
        <div className="hero-gradient-overlay"></div>

        {/* Dots Navigation */}
        <div className="hero-dots-container">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`hero-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Chuyển đến slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Arrow Navigation */}
        <button
          className="hero-arrow hero-arrow-left"
          onClick={() => goToSlide((currentSlide - 1 + slides.length) % slides.length)}
          aria-label="Slide trước"
        >
          <i className="bi bi-chevron-left"></i>
        </button>
        <button
          className="hero-arrow hero-arrow-right"
          onClick={() => nextSlide()}
          aria-label="Slide tiếp theo"
        >
          <i className="bi bi-chevron-right"></i>
        </button>
      </div>

      {/* Editorial Text Section (preserved from original) */}
      <div className="py-4 px-4 text-center">
        <div className="container" style={{ maxWidth: '800px' }}>
          <p className="text-muted-warm small text-uppercase mb-1" style={{ letterSpacing: '3px' }}>
            Bộ sưu tập đặc biệt
          </p>
          <h2
            className="fw-bold text-charcoal mb-0 font-sans text-uppercase"
            style={{ fontSize: '1.4rem', letterSpacing: '2px' }}
          >
            HiepPerfume
          </h2>
        </div>
      </div>
    </div>
  );
}

export default HeroBanner;
