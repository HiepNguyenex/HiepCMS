import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import postService from '../../services/postService';

function BlogDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        setLoading(true);
        const data = await postService.getPostById(id);
        setPost(data);
        setError(null);
      } catch (err) {
        console.error("Lỗi khi tải chi tiết bài viết:", err);
        setError("Không thể tải nội dung bài viết này.");
      } finally {
        setLoading(false);
      }
    };
    fetchPostDetail();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="container py-5 text-center min-vh-100 d-flex flex-column justify-content-center align-items-center">
          <div className="spinner-border text-dark mb-2" role="status"></div>
          <p className="text-muted-warm small">Đang nạp bài viết...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !post) {
    return (
      <>
        <Header />
        <div className="container py-5 text-center min-vh-100 d-flex flex-column justify-content-center align-items-center">
          <i className="bi bi-exclamation-triangle text-danger fs-1 mb-3"></i>
          <h3 className="font-serif fw-bold">Không tìm thấy bài viết</h3>
          <p className="text-muted-warm">{error || 'Bài viết không tồn tại.'}</p>
          <Link to="/blog" className="btn btn-dark px-4 py-2 mt-3">Quay lại danh sách tin tức</Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: '#F8F7F4' }}>
      <Header />

      {/* Breadcrumbs */}
      <div className="bg-white py-3 shadow-sm border-bottom text-start">
        <div className="container px-4">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0 text-uppercase small" style={{ letterSpacing: '1px' }}>
              <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-charcoal">Trang chủ</Link></li>
              <li className="breadcrumb-item"><Link to="/blog" className="text-decoration-none text-charcoal">Blog</Link></li>
              <li className="breadcrumb-item active text-muted-warm" aria-current="page" style={{ fontWeight: '600' }}>Chi tiết</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Main Post Container */}
      <div className="container flex-grow-1 py-5 px-4 text-start">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8 bg-white p-4 p-md-5" style={{ borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.02)' }}>
            
            {/* Meta details */}
            <div className="d-flex align-items-center gap-2 mb-3 small text-muted">
              <span>{post.createdDate ? new Date(post.createdDate).toLocaleDateString('vi-VN') : 'Mới cập nhật'}</span>
              <span>•</span>
              <span className="badge bg-light text-charcoal border-0 rounded-1 text-uppercase fw-semibold" style={{ fontSize: '0.65rem' }}>
                {post.categoryName || 'Tin tức'}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-serif fw-bold text-charcoal mb-4" style={{ fontSize: '2.5rem', lineHeight: '1.2' }}>
              {post.title}
            </h1>

            {/* Image banner */}
            {post.imageUrl && (
              <div className="mb-4 overflow-hidden" style={{ maxHeight: '400px', borderRadius: '12px' }}>
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-100 h-100 object-fit-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}

            {/* Post Content */}
            <div 
              className="post-content text-charcoal" 
              style={{ fontSize: '1.05rem', lineHeight: '1.8' }}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Bottom Actions */}
            <div className="border-top mt-5 pt-4 d-flex justify-content-between">
              <Link to="/blog" className="btn btn-outline-dark btn-sm rounded-pill px-4">
                <i className="bi bi-arrow-left me-1"></i> Quay lại Blog
              </Link>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default BlogDetail;
