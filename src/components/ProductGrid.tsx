'use client';

import React, { useState } from 'react';
import { Product } from '@/types';
import styles from '@/styles/ProductGrid.module.css';
import PaymentModal from './PaymentModal';

interface ProductGridProps {
  products: Product[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBuyClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleConfirmOrder = (orderDetails: any) => {
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
      <section className={styles.productsSection}>
        <div className={styles.productsGrid}>
          {products.map((product, index) => (
            <div key={product.id} className={styles.productCard} style={{ animationDelay: `${index * 0.1}s` }}>
              <img 
                src={product.image} 
                alt={product.name}
                className={styles.productImage}
              />
              <div className={styles.productContent}>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.productDescription}>{product.description}</p>
                <div className={styles.productFooter}>
                  <span className={styles.productPrice}>
                    R$ {product.price.toFixed(2)}
                  </span>
                  <button 
                    className={styles.buyButton}
                    onClick={() => handleBuyClick(product)}
                  >
                    Comprar
                  </button>
                </div>
              </div>
            </div>
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

export default ProductGrid;