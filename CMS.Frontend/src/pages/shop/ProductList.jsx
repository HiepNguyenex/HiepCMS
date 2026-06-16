import React from 'react';
import ProductCard from '../../components/ProductCard';

function ProductList({ products }) {
  return (
    <div className="row g-4">
      {products.map((product) => (
        <div key={product.id} className="col-12 col-sm-6 col-md-6 col-lg-4">
          <ProductCard item={product} />
        </div>
      ))}
    </div>
  );
}

export default ProductList;
