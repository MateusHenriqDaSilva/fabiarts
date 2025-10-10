'use client';

import React, { useState } from 'react';
import { Product, OrderDetails } from '@/types';
import styles from '@/styles/PaymentModal.module.css';

interface PaymentModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (orderDetails: OrderDetails) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ 
  product, 
  isOpen, 
  onClose, 
  onConfirm 
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'dinheiro' | 'cartao'>('pix');
  const [deliveryMethod, setDeliveryMethod] = useState<'retirada' | 'entrega'>('retirada');
  const [address, setAddress] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    const orderDetails: OrderDetails = {
      product,
      paymentMethod,
      deliveryMethod,
      address: deliveryMethod === 'entrega' ? address : undefined
    };
    onConfirm(orderDetails);
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Finalizar Compra</h3>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.productInfo}>
          <h4>{product.name}</h4>
          <p className={styles.productPrice}>R$ {product.price.toFixed(2)}</p>
        </div>

        <div className={styles.modalContent}>
          {/* Coluna Pagamento */}
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>💳 Forma de Pagamento</h4>
            <div className={styles.options}>
              <label className={styles.option}>
                <input
                  type="radio"
                  name="payment"
                  value="pix"
                  checked={paymentMethod === 'pix'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'pix')}
                />
                <span className={styles.optionText}>
                  <strong>PIX</strong>
                  <small>Pagamento instantâneo</small>
                </span>
              </label>

              <label className={styles.option}>
                <input
                  type="radio"
                  name="payment"
                  value="cartao"
                  checked={paymentMethod === 'cartao'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'cartao')}
                />
                <span className={styles.optionText}>
                  <strong>Cartão de Crédito/Débito</strong>
                  <small>Maquininha</small>
                </span>
              </label>

              <label className={styles.option}>
                <input
                  type="radio"
                  name="payment"
                  value="dinheiro"
                  checked={paymentMethod === 'dinheiro'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'dinheiro')}
                />
                <span className={styles.optionText}>
                  <strong>Dinheiro</strong>
                  <small>Pagamento na entrega</small>
                </span>
              </label>
            </div>
          </div>

          {/* Coluna Entrega */}
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>🚚 Tipo de Entrega</h4>
            <div className={styles.options}>
              <label className={styles.option}>
                <input
                  type="radio"
                  name="delivery"
                  value="retirada"
                  checked={deliveryMethod === 'retirada'}
                  onChange={(e) => setDeliveryMethod(e.target.value as 'retirada')}
                />
                <span className={styles.optionText}>
                  <strong>Retirada no Local</strong>
                  <small>Residencial Albuquerque Lins</small>
                </span>
              </label>

              <label className={styles.option}>
                <input
                  type="radio"
                  name="delivery"
                  value="entrega"
                  checked={deliveryMethod === 'entrega'}
                  onChange={(e) => setDeliveryMethod(e.target.value as 'entrega')}
                />
                <span className={styles.optionText}>
                  <strong>Entrega em Domicílio</strong>
                  <small>Taxa de entrega conforme localização</small>
                </span>
              </label>
            </div>

            {deliveryMethod === 'entrega' && (
              <div className={styles.addressField}>
                <label>Endereço de Entrega:</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Digite seu endereço completo..."
                  rows={3}
                />
              </div>
            )}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancelar
          </button>
          <button className={styles.confirmButton} onClick={handleConfirm}>
            Finalizar Compra
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;