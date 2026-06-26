import React from 'react';
import { Link } from 'react-router-dom';

function NewsSection({ posts }) {
  // Định dạng ngày
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <section id="fashion-journal" className="py-5 bg-white">
      <div className="container px-4">
        <div className="text-center mb-5">
          <span className="text-uppercase text-muted-warm fw-semibold mb-2 d-block" style={{ fontSize: '0.8rem', letterSpacing: '2px' }}>
            Xu hướng & Cẩm nang
          </span>
          <h2 className="fw-bold font-serif" style={{ fontSize: '2.2rem' }}>XU HƯỚNG THỜI TRANG</h2>
          <p className="text-muted-warm small mt-1">Cập nhật những mẹo phối đồ và tin tức phong cách mới nhất cùng HiepPerfume</p>
          <div className="accent-line"></div>
        </div>
 
        <div className="row g-4 justify-content-center">
          {posts.slice(0, 3).map((post) => (
            <div key={post.id} className="col-lg-4 col-md-6 col-sm-10">
              <div className="card h-100 news-card bg-white">
                {/* Excerpt image */}
                <div style={{ height: '200px', overflow: 'hidden' }}>
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-100 h-100 object-fit-cover"
                    style={{ transition: 'transform 0.4s ease' }}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                    }}
                  />
                </div>
 
                {/* Excerpt body */}
                <div className="card-body d-flex flex-column align-items-start p-4 text-start">
                  <div className="d-flex align-items-center gap-2 mb-2" style={{ fontSize: '0.75rem' }}>
                    <span className="text-muted-warm"><i className="bi bi-calendar3 me-1"></i>{formatDate(post.createdDate)}</span>
                    <span className="text-muted">•</span>
                    <span className="badge bg-light text-charcoal border-0 rounded-1 text-uppercase fw-semibold" style={{ fontSize: '0.6rem', padding: '0.3em 0.6em' }}>
                      {post.categoryName || 'Tin tức'}
                    </span>
                  </div>

                  <h5 className="card-title font-serif fw-bold text-charcoal mb-2" style={{ fontSize: '1.2rem', lineHeight: '1.3' }}>
                    {post.title}
                  </h5>

                  <p className="card-text text-muted-warm small text-truncate-3-lines mb-3" style={{ lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {post.content}
                  </p>

                  <Link
                    to={`/blog/${post.id}`}
                    className="mt-auto text-charcoal fw-bold text-decoration-none text-uppercase"
                    style={{ fontSize: '0.75rem', letterSpacing: '1px' }}
                  >
                    Đọc bài viết <i className="bi bi-arrow-right ms-1"></i>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default NewsSection;
