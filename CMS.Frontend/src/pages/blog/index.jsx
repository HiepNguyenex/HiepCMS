import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PostCard from '../../components/PostCard';
import BlogSidebar from './BlogSidebar';
import postService from '../../services/postService';

function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data = await postService.getAllPosts();
        setPosts(data);
        setError(null);
      } catch (err) {
        console.error("Lỗi khi tải bài viết trang Blog:", err);
        setError("Không thể tải danh sách bài viết từ máy chủ.");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter((post) => {
    return selectedCategoryId === null || post.categoryId === selectedCategoryId;
  });

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: '#F8F7F4' }}>
      <Header />

      {/* Page Title */}
      <div className="bg-white py-4 shadow-sm border-bottom text-start">
        <div className="container px-4">
          <nav aria-label="breadcrumb" className="mb-2">
            <ol className="breadcrumb mb-0 text-uppercase small" style={{ letterSpacing: '1px' }}>
              <li className="breadcrumb-item"><a href="/" className="text-decoration-none text-charcoal">Trang chủ</a></li>
              <li className="breadcrumb-item active text-muted-warm" aria-current="page" style={{ fontWeight: '600' }}>Tin tức & Blog</li>
            </ol>
          </nav>
          <h2 className="fw-bold font-serif mb-0 text-charcoal">BLOG HIEPPERFUME</h2>
        </div>
      </div>

      {/* Main Content */}
      <div className="container flex-grow-1 py-5 px-4">
        <div className="row g-4">
          {/* Left Post Grid */}
          <div className="col-12 col-md-8 col-lg-9 text-start">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-dark" role="status"></div>
                <p className="mt-2 text-muted-warm small">Đang nạp bài viết...</p>
              </div>
            ) : error ? (
              <div className="alert alert-warning text-center" role="alert">
                {error}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted-warm">Chưa có bài viết nào thuộc chuyên mục này.</p>
              </div>
            ) : (
              <div className="row g-4">
                {filteredPosts.map((post) => (
                  <div key={post.id} className="col-12 col-md-6 col-lg-4">
                    <PostCard post={post} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="col-12 col-md-4 col-lg-3">
            <BlogSidebar
              activeCategoryId={selectedCategoryId}
              onCategorySelect={setSelectedCategoryId}
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Blog;
