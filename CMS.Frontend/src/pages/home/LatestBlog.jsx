import React, { useState, useEffect } from 'react';
import postService from '../../services/postService';
import PostCard from '../../components/PostCard';

function LatestBlog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestBlogs = async () => {
      try {
        setLoading(true);
        const data = await postService.getAllPosts();
        // Sắp xếp bài viết mới nhất (theo ID giảm dần) và lấy 3 bài
        const topThree = data.sort((a, b) => b.id - a.id).slice(0, 3);
        setPosts(topThree);
      } catch (err) {
        console.error("Lỗi khi tải tin tức:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLatestBlogs();
  }, []);

  if (loading) {
    return (
      <div className="container my-4 text-center">
        <div className="spinner-border spinner-border-sm text-dark" role="status"></div>
        <span className="ms-2 text-muted" style={{ fontSize: '14px' }}>Đang nạp tin tức xu hướng...</span>
      </div>
    );
  }

  return (
    <section id="fashion-journal" className="py-5 bg-light text-start">
      <div className="container px-4">
        <div className="text-center mb-5">
          <span className="text-uppercase text-muted-warm fw-semibold mb-2 d-block" style={{ fontSize: '0.8rem', letterSpacing: '2px' }}>
            Xu hướng & Cẩm nang
          </span>
          <h2 className="fw-bold font-serif" style={{ fontSize: '2.2rem' }}>XU HƯỚNG MÙI HƯƠNG</h2>
          <p className="text-muted-warm small mt-1">Cập nhật những mẹo sử dụng nước hoa và tin tức phong cách mới nhất cùng HiepPerfume</p>
          <div className="accent-line"></div>
        </div>

        <div className="row g-4 justify-content-center">
          {posts.map((post) => (
            <div key={post.id} className="col-lg-4 col-md-6 col-sm-10">
              <PostCard post={post} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default LatestBlog;
