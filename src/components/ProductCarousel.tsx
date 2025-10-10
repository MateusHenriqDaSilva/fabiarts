'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from '@/styles/ProductCarousel.module.css';
import PaymentModal from './PaymentModal';
import { Product, OrderDetails } from '@/types';

const ProductCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const products: Product[] = [
    { id: 1, name: 'Porta-joias Resina', image: '/destaque1.jpg', price: 89.90, category: 'resina', description: 'Porta-joias em resina artesanal' },
    { id: 2, name: 'Abajur Decorativo', image: '/destaque2.jpg', price: 149.90, category: 'resina', description: 'Abajur decorativo em resina' },
    { id: 3, name: 'Escultura Resina', image: '/destaque3.jpg', price: 199.90, category: 'resina', description: 'Escultura exclusiva em resina' },
    { id: 4, name: 'Bandija Resina', image: '/destaque4.jpg', price: 79.90, category: 'resina', description: 'Bandija decorativa em resina' },
    { id: 5, name: 'Vaso Artesanal', image: '/destaque5.jpg', price: 99.90, category: 'resina', description: 'Vaso artesanal premium' },
    { id: 6, name: 'Cubo Decorativo', image: '/destaque6.jpg', price: 69.90, category: 'resina', description: 'Cubo decorativo moderno' },
    { id: 7, name: 'Porta-retrato', image: '/destaque7.jpg', price: 59.90, category: 'resina', description: 'Porta-retrato personalizado' },
    { id: 8, name: 'Luminária Resina', image: '/destaque8.jpg', price: 129.90, category: 'resina', description: 'Luminária em resina artesanal' },
    { id: 9, name: 'Cachepô Moderno', image: '/destaque9.jpg', price: 89.90, category: 'resina', description: 'Cachepô moderno decorativo' },
  ];

  const productsPerView = 3;
  const totalSlides = Math.ceil(products.length / productsPerView);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === totalSlides - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? totalSlides - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const handleBuyClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleConfirmOrder = (orderDetails: OrderDetails) => {
    const { product, paymentMethod, deliveryMethod, address } = orderDetails;
    
    const whatsappNumber = "5514988068948";
    
    let message = `Olá! Gostaria de comprar o produto:\n\n`;
    message += `*${product.name}*\n`;
    message += `💵 *Preço:* R$ ${product.price.toFixed(2)}\n\n`;
    
    message += `💳 *Forma de Pagamento:*\n`;
    switch(paymentMethod) {
      case 'pix':
        message += `• PIX (Pagamento instantâneo)\n`;
        break;
      case 'cartao':
        message += `• Cartão de Crédito/Débito (Maquininha)\n`;
        break;
      case 'dinheiro':
        message += `• Dinheiro (Pagamento na entrega)\n`;
        break;
    }
    
    message += `\n🚚 *Tipo de Entrega:*\n`;
    if (deliveryMethod === 'retirada') {
      message += `• Retirada no Local\n`;
      message += `📍 Residencial Albuquerque Lins 10-54\n`;
    } else {
      message += `• Entrega em Domicílio\n`;
      if (address) {
        message += `📍 Endereço: ${address}\n`;
      }
    }
    
    message += `\nPoderia confirmar minha compra?`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      <section className={styles.carouselSection}>
        <h2 className={styles.title}>Produtos em Destaque</h2>
        
        <div className={styles.carouselContainer}>
          <div 
            className={styles.carouselTrack}
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {products.map((product) => (
              <div key={product.id} className={styles.carouselSlide}>
                <Image 
                  src={product.image} 
                  alt={product.name}
                  className={styles.productImage}
                  width={400}
                  height={300}
                  priority
                />
                <div className={styles.productInfo}>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <p className={styles.productPrice}>R$ {product.price.toFixed(2)}</p>
                  <button 
                    className={styles.buyButton}
                    onClick={() => handleBuyClick(product)}
                  >
                    Comprar
                  </button>
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

      {selectedProduct && (
        <PaymentModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onConfirm={handleConfirmOrder}
        />
      )}
    </>
  );
};

export default ProductCarousel;