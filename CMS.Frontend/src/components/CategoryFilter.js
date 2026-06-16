import React from 'react';

function CategoryFilter({ categories, activeCategory, setActiveCategory }) {
  return (
    <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
      {/* Tab: Tất cả sản phẩm */}
      <button
        type="button"
        className={`category-tab ${activeCategory === null ? 'active' : ''}`}
        onClick={() => setActiveCategory(null)}
      >
        Tất Cả Sản Phẩm
      </button>

      {/* Dynamic Tabs from Database */}
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
          onClick={() => setActiveCategory(cat.id)}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}

export default CategoryFilter;
