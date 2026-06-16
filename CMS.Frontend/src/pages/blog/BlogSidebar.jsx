import React, { useState, useEffect } from 'react';
import postService from '../../services/postService';

function BlogSidebar({ activeCategoryId, onCategorySelect }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await postService.getAllCategories();
        setCategories(data);
      } catch (err) {
        console.error("Lỗi khi tải chuyên mục blog ở BlogSidebar:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="blog-sidebar p-3 bg-white shadow-sm text-start" style={{ borderRadius: '12px' }}>
      <h5 className="fw-bold font-serif mb-3 pb-2 border-bottom text-charcoal" style={{ fontSize: '1.1rem' }}>
        CHUYÊN MỤC BLOG
      </h5>
      {loading ? (
        <div className="text-center py-2">
          <div className="spinner-border spinner-border-sm text-dark" role="status"></div>
        </div>
      ) : (
        <ul className="list-unstyled mb-0">
          <li className="mb-2">
            <button
              className={`btn btn-link p-0 text-decoration-none text-start w-100 ${activeCategoryId === null ? 'fw-bold text-dark' : 'text-secondary'}`}
              onClick={() => onCategorySelect(null)}
              style={{ fontSize: '0.9rem' }}
            >
              <i className="bi bi-chevron-right me-1" style={{ fontSize: '10px' }}></i> Tất cả bài viết
            </button>
          </li>
          {categories.map((cat) => (
            <li className="mb-2" key={cat.id}>
              <button
                className={`btn btn-link p-0 text-decoration-none text-start w-100 ${activeCategoryId === cat.id ? 'fw-bold text-dark' : 'text-secondary'}`}
                onClick={() => onCategorySelect(cat.id)}
                style={{ fontSize: '0.9rem' }}
              >
                <i className="bi bi-chevron-right me-1" style={{ fontSize: '10px' }}></i> {cat.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default BlogSidebar;
