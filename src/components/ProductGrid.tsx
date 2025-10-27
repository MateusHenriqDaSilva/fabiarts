'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import styles from '@/styles/ProductGrid.module.css';
import { useCart } from './CartContext';

interface ProductGridProps {
  products: Product[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  const [showAddedMessage, setShowAddedMessage] = useState<number | null>(null);
  const { addToCart, triggerAnimation } = useCart();

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    triggerAnimation();
    setShowAddedMessage(product.id);
    
    setTimeout(() => {
      setShowAddedMessage(null);
    }, 2000);
    
    console.log(`✅ Produto "${product.name}" adicionado ao carrinho!`);
  };

  return (
    <section className={styles.productsSection}>
      <div className={styles.productsGrid}>
        {products.map((product, index) => (
          <div key={product.id} className={styles.productCard} style={{ animationDelay: `${index * 0.1}s` }}>
            <Image 
              src={product.image} 
              alt={product.name}
              className={styles.productImage}
              width={400}
              height={250}
            />
            <div className={styles.productContent}>
              <h3 className={styles.productName}>{product.name}</h3>
              <p className={styles.productDescription}>{product.description}</p>
              
              {showAddedMessage === product.id && (
                <div className={styles.addedMessage}>
                  ✅ Adicionado ao carrinho!
                </div>
              )}
              
              <div className={styles.productFooter}>
                <span className={styles.productPrice}>
                  R$ {product.price.toFixed(2)}
                </span>
                <button 
                  className={styles.buyButton}
                  onClick={() => handleAddToCart(product)}
                >
                  <ShoppingCart size={16} />
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductGrid;