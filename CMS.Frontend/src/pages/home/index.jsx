import React, { useState } from 'react';
import Header from '../../components/Header';
import HeroBanner from './HeroBanner';
import IngredientSection from '../../components/IngredientSection';
import CategoryMenu from './CategoryMenu';
import ProductGrid from './ProductGrid';
import NewArrivals from './NewArrivals';
import Bestsellers from './Bestsellers';
import LatestBlog from './LatestBlog';
import Footer from '../../components/Footer';

function Home() {
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  return (
    <div className="homepage-container animate-fade-in">
      {/* TẦNG 1: Header */}
      <Header />

      {/* TẦNG 2: Hero Banner */}
      <HeroBanner />

      {/* TẦNG BỔ SUNG: Triết lý nốt hương nước hoa */}
      <IngredientSection />

      {/* TẦNG 3: Category Menu ngang */}
      <CategoryMenu 
        activeCategoryId={selectedCategoryId} 
        onCategorySelect={setSelectedCategoryId} 
      />

      {/* TẦNG 4: Lưới sản phẩm */}
      <ProductGrid selectedCategoryId={selectedCategoryId} />

      {/* TẦNG 4.1: Sản phẩm mới nhất */}
      <NewArrivals />

      {/* TẦNG 4.2: Sản phẩm bán chạy */}
      <Bestsellers />

      {/* TẦNG 5: Khối bài viết tin tức */}
      <LatestBlog />

      {/* TẦNG 6: Footer */}
      <Footer />
    </div>
  );
}

export default Home;
