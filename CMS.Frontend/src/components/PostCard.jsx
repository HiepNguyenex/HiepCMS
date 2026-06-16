import React from 'react';
import { Link } from 'react-router-dom';

function PostCard({ post }) {
  return (
    <div className="card h-100 news-card bg-white" style={{ borderRadius: '12px', overflow: 'hidden', transition: '0.3s' }}>
      <div style={{ height: '200px', overflow: 'hidden' }}>
        <img
          src={post.imageUrl}
          className="w-100 h-100 object-fit-cover"
          alt={post.title}
          style={{ transition: 'transform 0.4s ease' }}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
          }}
        />
      </div>

      <div className="card-body d-flex flex-column align-items-start p-4 text-start">
        <div className="d-flex align-items-center gap-2 mb-2" style={{ fontSize: '0.75rem' }}>
          <span className="text-muted-warm">
            <i className="bi bi-calendar3 me-1"></i>
            {post.createdDate ? new Date(post.createdDate).toLocaleDateString('vi-VN') : 'Mới cập nhật'}
          </span>
          <span className="text-muted">•</span>
          <span className="badge bg-light text-charcoal border-0 rounded-1 text-uppercase fw-semibold" style={{ fontSize: '0.6rem', padding: '0.3em 0.6em' }}>
            {post.categoryName || 'Tin tức'}
          </span>
        </div>

        <h5 className="card-title font-serif fw-bold text-charcoal mb-2" style={{ fontSize: '1.2rem', lineHeight: '1.3', minHeight: '50px' }}>
          <Link to={`/blog/${post.id}`} className="text-decoration-none text-charcoal">
            {post.title}
          </Link>
        </h5>

        <p className="card-text text-muted-warm small text-truncate-3-lines mb-3" style={{ lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {post.content}
        </p>

        <Link
          to={`/blog/${post.id}`}
          className="mt-auto btn p-0 text-charcoal fw-bold border-0 bg-transparent text-uppercase"
          style={{ fontSize: '0.75rem', letterSpacing: '1px' }}
        >
          Đọc bài viết <i className="bi bi-arrow-right ms-1"></i>
        </Link>
      </div>
    </div>
  );
}

export default PostCard;
