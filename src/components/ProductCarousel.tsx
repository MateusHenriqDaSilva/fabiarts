'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import styles from '@/styles/ProductCarousel.module.css';
import { Product } from '@/types';
import { useCart } from './CartContext';

const ProductCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [productsPerView, setProductsPerView] = useState(3);
  const [showAddedMessage, setShowAddedMessage] = useState<number | null>(null);
  
  const { addToCart, triggerAnimation } = useCart();
  
  const products: Product[] = [
    { 
      id: 1, 
      name: 'Porta-joias Resina', 
      image: '/destaque1.jpg', 
      price: 89.90, 
      category: 'resina', 
      description: 'Porta-joias em resina artesanal' 
    },
    { 
      id: 2, 
      name: 'Abajur Decorativo', 
      image: '/destaque2.jpg', 
      price: 149.90, 
      category: 'resina', 
      description: 'Abajur decorativo em resina' 
    },
    { 
      id: 3, 
      name: 'Escultura Resina', 
      image: '/destaque3.jpg', 
      price: 199.90, 
      category: 'resina', 
      description: 'Escultura exclusiva em resina' 
    },
    { 
      id: 4, 
      name: 'Bandija Resina', 
      image: '/destaque4.jpg', 
      price: 79.90, 
      category: 'resina', 
      description: 'Bandija decorativa em resina' 
    },
    { 
      id: 5, 
      name: 'Vaso Artesanal', 
      image: '/destaque5.jpg', 
      price: 99.90, 
      category: 'resina', 
      description: 'Vaso artesanal premium' 
    },
    { 
      id: 6, 
      name: 'Cubo Decorativo', 
      image: '/destaque6.jpg', 
      price: 69.90, 
      category: 'resina', 
      description: 'Cubo decorativo moderno' 
    },
    { 
      id: 7, 
      name: 'Porta-retrato', 
      image: '/destaque7.jpg', 
      price: 59.90, 
      category: 'resina', 
      description: 'Porta-retrato personalizado' 
    },
    { 
      id: 8, 
      name: 'Luminária Resina', 
      image: '/destaque8.jpg', 
      price: 129.90, 
      category: 'resina', 
      description: 'Luminária em resina artesanal' 
    },
    { 
      id: 9, 
      name: 'Cachepô Moderno', 
      image: '/destaque9.jpg', 
      price: 89.90, 
      category: 'resina', 
      description: 'Cachepô moderno decorativo' 
    },
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 480) {
        setProductsPerView(1);
      } else if (window.innerWidth < 768) {
        setProductsPerView(2);
      } else {
        setProductsPerView(3);
      }
      setCurrentIndex(0);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalSlides = Math.ceil(products.length / productsPerView);

  const getTransformValue = () => {
    return `translateX(-${currentIndex * 100}%)`;
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex >= totalSlides - 1) {
        return 0;
      }
      return prevIndex + 1;
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex <= 0) {
        return totalSlides - 1;
      }
      return prevIndex - 1;
    });
  };

  const goToSlide = (index: number) => {
    if (index >= 0 && index < totalSlides) {
      setCurrentIndex(index);
    }
  };

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
    <section className={styles.carouselSection}>
      <div className={styles.carouselContainer}>
        <div 
          className={styles.carouselTrack}
          style={{ transform: getTransformValue() }}
        >
          {products.map((product) => (
            <div key={product.id} className={styles.carouselSlide}>
              <div className={styles.carouselSlideContent}>
                <div className={styles.imageContainer}>
                  <Image 
                    src={product.image} 
                    alt={product.name}
                    className={styles.productImage}
                    width={400}
                    height={300}
                    priority
                  />
                </div>
                <div className={styles.productInfo}>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <p className={styles.productDescription}>{product.description}</p>
                  <p className={styles.productPrice}>R$ {product.price.toFixed(2)}</p>
                  
                  {showAddedMessage === product.id && (
                    <div className={styles.addedMessage}>
                      ✅ Adicionado ao carrinho!
                    </div>
                  )}
                  
                  <button 
                    className={styles.buyButton}
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingCart size={16} />
                    Adicionar ao Carrinho
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={prevSlide}
          className={`${styles.navButton} ${styles.prevButton}`}
          aria-label="Slide anterior"
        >
          <ChevronLeft size={18} />
        </button>
        
        <button 
          onClick={nextSlide}
          className={`${styles.navButton} ${styles.nextButton}`}
          aria-label="Próximo slide"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className={styles.carouselIndicators}>
        {Array.from({ length: totalSlides }).map((_, index) => (
          <button
            key={index}
            className={`${styles.indicator} ${index === currentIndex ? styles.active : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default ProductCarousel;