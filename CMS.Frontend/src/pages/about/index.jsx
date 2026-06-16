import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

function About() {
  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: '#F8F7F4' }}>
      <Header />

      {/* Page Title & Breadcrumb */}
      <div className="bg-white py-4 shadow-sm border-bottom text-start">
        <div className="container px-4">
          <nav aria-label="breadcrumb" className="mb-2">
            <ol className="breadcrumb mb-0 text-uppercase small" style={{ letterSpacing: '1px' }}>
              <li className="breadcrumb-item"><a href="/" className="text-decoration-none text-charcoal">Trang chủ</a></li>
              <li className="breadcrumb-item active text-muted-warm" aria-current="page" style={{ fontWeight: '600' }}>Về chúng tôi</li>
            </ol>
          </nav>
          <h2 className="fw-bold font-serif mb-0 text-charcoal">CÂU CHUYỆN HIEPPERFUME</h2>
        </div>
      </div>

      {/* Main Content */}
      <div className="container flex-grow-1 py-5 px-4 text-start">
        <div className="bg-white p-4 p-md-5" style={{ borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.02)' }}>
          <div className="row g-5 align-items-center">
            {/* Brand Story text */}
            <div className="col-lg-6">
              <span className="text-uppercase text-muted-warm fw-semibold d-block mb-2 animate-fade-in" style={{ fontSize: '0.8rem', letterSpacing: '2px' }}>
                Khởi nguồn của một mùi hương
              </span>
              <h1 className="font-serif fw-bold text-charcoal mb-4" style={{ fontSize: '2.5rem', lineHeight: '1.2' }}>
                Hành Trình Định Hình<br />Phong Cách Cá Nhân
              </h1>
              <p className="text-muted-warm mb-4" style={{ fontSize: '1.05rem', lineHeight: '1.8' }}>
                Được thành lập với tầm nhìn trở thành điểm đến hàng đầu dành cho những tín đồ say mê nghệ thuật nước hoa cao cấp, 
                <strong> HiepPerfume</strong> tin rằng mỗi chai nước hoa không đơn thuần là một mùi hương, mà là một ngôn ngữ không lời 
                giúp khẳng định bản sắc cá nhân độc bản của bạn.
              </p>
              <p className="text-muted-warm mb-4" style={{ fontSize: '1.05rem', lineHeight: '1.8' }}>
                Chúng tôi cam kết tuyển chọn những dòng nước hoa danh giá nhất từ các nhà mốt danh tiếng hàng đầu thế giới (Chanel, Dior, YSL, Le Labo...). 
                Mỗi giọt hương trao đến tay khách hàng đều là sự chắt lọc tinh tế nhất từ thiên nhiên và nghệ thuật sáng chế đỉnh cao.
              </p>
            </div>

            {/* Brand Image / Poster */}
            <div className="col-lg-6">
              <div className="position-relative overflow-hidden" style={{ borderRadius: '12px', height: '400px' }}>
                <img 
                  src="https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800" 
                  alt="HiepPerfume Story" 
                  className="w-100 h-100 object-fit-cover"
                />
              </div>
            </div>
          </div>

          <hr className="my-5" style={{ opacity: 0.1 }} />

          {/* Core Values */}
          <div className="row g-4 justify-content-center text-center">
            <h3 className="font-serif fw-bold text-charcoal mb-5" style={{ fontSize: '2rem' }}>GIÁ TRỊ CỐT LÕI</h3>
            
            <div className="col-md-4">
              <div className="p-3">
                <div className="mb-3 text-dark">
                  <i className="bi bi-patch-check fs-1"></i>
                </div>
                <h5 className="fw-bold font-serif text-charcoal mb-2">100% CHÍNH HÃNG</h5>
                <p className="text-muted-warm small" style={{ lineHeight: '1.6' }}>
                  Cam kết tuyệt đối về nguồn gốc xuất xứ của từng chai nước hoa. Bảo hành chất lượng trọn đời sản phẩm.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-3">
                <div className="mb-3 text-dark">
                  <i className="bi bi-stars fs-1"></i>
                </div>
                <h5 className="fw-bold font-serif text-charcoal mb-2">HƯƠNG THƠM ĐỘC BẢN</h5>
                <p className="text-muted-warm small" style={{ lineHeight: '1.6' }}>
                  Đội ngũ chuyên gia mùi hương giàu kinh nghiệm luôn sẵn sàng hỗ trợ bạn tìm thấy nốt hương định hình phong cách cá nhân tốt nhất.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-3">
                <div className="mb-3 text-dark">
                  <i className="bi bi-heart-fill fs-1"></i>
                </div>
                <h5 className="fw-bold font-serif text-charcoal mb-2">DỊCH VỤ PREMIUM</h5>
                <p className="text-muted-warm small" style={{ lineHeight: '1.6' }}>
                  Hỗ trợ đổi trả trong vòng 7 ngày, miễn phí giao hàng toàn quốc và dịch vụ gói quà nghệ thuật sang trọng.
                </p>
              </div>
            </div>
          </div>

          <hr className="my-5" style={{ opacity: 0.1 }} />

          {/* Student / Author Details */}
          <div className="bg-light p-4 rounded-3 text-center col-lg-8 mx-auto">
            <h5 className="fw-bold font-serif text-charcoal mb-2" style={{ fontSize: '1.2rem' }}>ĐỒ ÁN PHÁT TRIỂN HỆ THỐNG THÔNG TIN CMS</h5>
            <p className="text-muted-warm small mb-3">Được thực hiện bởi sinh viên lớp Phát Triển Hệ Thống CMS</p>
            <div className="d-flex flex-column flex-sm-row justify-content-center gap-3 gap-sm-5 fw-semibold text-charcoal">
              <span><i className="bi bi-person me-1"></i>Sinh viên: Nguyễn Vũ Hiệp</span>
              <span><i className="bi bi-card-text me-1"></i>MSSV: 2123110161</span>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}

export default About;
