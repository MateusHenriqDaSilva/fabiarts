'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Heart,
  ShoppingCart,
  CreditCard,
  Check,
  ArrowLeft
} from 'lucide-react';
import { Product, OrderDetails } from '@/types';
import { useCart } from './CartContext';
import styles from '../styles/ModalCarrinho.module.css';

interface ModalCarrinhoProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CartItem {
  product: Product;
  quantity: number;
}

type ModalView = 'carrinho' | 'pagamento';

// Interface para dados do cartão
interface CardData {
  number: string;
  name: string;
  expiry: string;
  cvc: string;
  installments: number;
}

// Interface para erros do cartão (todas as propriedades são strings opcionais)
interface CardErrors {
  number?: string;
  name?: string;
  expiry?: string;
  cvc?: string;
  installments?: string;
}

const ModalCarrinho: React.FC<ModalCarrinhoProps> = ({ isOpen, onClose }) => {
  const { cartItems, addToCart, removeFromCart, clearCart, getTotalItems } = useCart();
  const [savedItems, setSavedItems] = useState<CartItem[]>([]);
  const [currentView, setCurrentView] = useState<ModalView>('carrinho');

  // Estados para o pagamento
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'dinheiro' | 'cartao'>('pix');
  const [deliveryMethod, setDeliveryMethod] = useState<'retirada' | 'entrega'>('retirada');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const [paymentUrl, setPaymentUrl] = useState<string>('');

  // Estados para pagamento com cartão
  const [cardData, setCardData] = useState<CardData>({
    number: '',
    name: '',
    expiry: '',
    cvc: '',
    installments: 1
  });
  const [cardErrors, setCardErrors] = useState<CardErrors>({}); // Tipo corrigido

  // Produtos relacionados (exemplo)
  const relatedProducts: Product[] = [
    { id: 10, name: 'Kit Presente Premium', image: '/related1.jpg', price: 199.90, category: 'resina', description: 'Kit especial para presentear' },
    { id: 11, name: 'Perfume Importado', image: '/related2.jpg', price: 159.90, category: 'madeira', description: 'Fragrância exclusiva' },
    { id: 12, name: 'Creme Hidratante', image: '/related3.jpg', price: 89.90, category: 'mesa', description: 'Hidratação profunda' },
  ];

  // Calcular totais
  const subtotal = cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const totalItems = getTotalItems();

  // Aplicar desconto para compras acima de R$ 100
  const discount = subtotal > 100 ? subtotal * 0.1 : 0;
  const total = subtotal - discount;

  // Funções do carrinho
  const increaseQuantity = (product: Product) => {
    addToCart(product);
  };

  const decreaseQuantity = (productId: number) => {
    const item = cartItems.find(item => item.product.id === productId);
    if (item && item.quantity > 1) {
      removeFromCart(productId);
      addToCart(item.product);
    } else {
      removeFromCart(productId);
    }
  };

  const removeItem = (productId: number) => {
    removeFromCart(productId);
  };

  const saveForLater = (item: CartItem) => {
    setSavedItems(prev => [...prev, item]);
    removeFromCart(item.product.id);
  };

  const moveToCart = (item: CartItem) => {
    addToCart(item.product);
    setSavedItems(prev => prev.filter(saved => saved.product.id !== item.product.id));
  };

  const removeSaved = (productId: number) => {
    setSavedItems(prev => prev.filter(item => item.product.id !== productId));
  };

  // Função para ir para o pagamento
  const handleGoToPayment = () => {
    if (cartItems.length === 0) {
      alert('Seu carrinho está vazio!');
      return;
    }
    setCurrentView('pagamento');
  };

  // Função para voltar ao carrinho
  const handleBackToCart = () => {
    setCurrentView('carrinho');
    setQrCode('');
    setPaymentUrl('');
    setCardErrors({});
  };

  // Validação do cartão - CORRIGIDA
  const validateCard = (): boolean => {
    const errors: CardErrors = {}; // Usando a interface específica

    // Validar número do cartão (apenas números, 13-19 dígitos)
    const cleanNumber = cardData.number.replace(/\s/g, '');
    if (!cleanNumber.match(/^\d{13,19}$/)) {
      errors.number = 'Número do cartão inválido';
    }

    // Validar nome
    if (!cardData.name.trim() || cardData.name.length < 3) {
      errors.name = 'Nome no cartão é obrigatório';
    }

    // Validar data de expiração (MM/YY)
    if (!cardData.expiry.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
      errors.expiry = 'Data inválida (MM/AA)';
    }

    // Validar CVC (3-4 dígitos)
    if (!cardData.cvc.match(/^\d{3,4}$/)) {
      errors.cvc = 'CVC inválido';
    }

    // Validar parcelas - JÁ É NUMBER, SEM CONVERSÃO NECESSÁRIA
    if (cardData.installments < 1 || cardData.installments > 12) {
      errors.installments = 'Número de parcelas inválido';
    }

    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Formatar número do cartão
  const formatCardNumber = (value: string): string => {
    const cleanValue = value.replace(/\D/g, '');
    const formatted = cleanValue.replace(/(\d{4})/g, '$1 ').trim();
    return formatted.slice(0, 19); // Limita a 16 dígitos + espaços
  };

  // Formatar data de expiração
  const formatExpiry = (value: string): string => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length >= 2) {
      return `${cleanValue.slice(0, 2)}/${cleanValue.slice(2, 4)}`;
    }
    return cleanValue;
  };

  // Handler para mudanças nos campos do cartão - CORRIGIDA
  const handleCardChange = (field: keyof CardData, value: string | number) => {
    let formattedValue: string | number = value;

    if (field === 'number') {
      formattedValue = formatCardNumber(value as string);
    } else if (field === 'expiry') {
      formattedValue = formatExpiry(value as string);
    } else if (field === 'cvc') {
      formattedValue = (value as string).replace(/\D/g, '').slice(0, 4);
    } else if (field === 'installments') {
      // Garantir que sempre seja number
      const numValue = parseInt(value as string) || 1;
      formattedValue = Math.min(Math.max(numValue, 1), 12);
    }

    setCardData(prev => ({
      ...prev,
      [field]: formattedValue
    }));

    // Limpar erro do campo quando usuário começar a digitar
    if (cardErrors[field]) {
      setCardErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Função específica para o select de parcelas - NOVA FUNÇÃO
  const handleInstallmentsChange = (value: string) => {
    const numValue = parseInt(value) || 1;
    const installments = Math.min(Math.max(numValue, 1), 12);

    setCardData(prev => ({
      ...prev,
      installments
    }));

    // Limpar erro se existir
    if (cardErrors.installments) {
      setCardErrors(prev => ({
        ...prev,
        installments: undefined
      }));
    }
  };

  // Função para obter token do cartão via Mercado Pago
  const getCardToken = async (): Promise<string> => {
    // Em uma implementação real, você usaria o MercadoPago.js para tokenizar o cartão
    // Esta é uma simulação - na prática você precisaria integrar com a SDK do Mercado Pago

    return new Promise((resolve, reject) => {
      // Simulação de tokenização
      setTimeout(() => {
        const cleanNumber = cardData.number.replace(/\s/g, '');
        if (cleanNumber.startsWith('4')) {
          resolve('visa_token_' + Math.random().toString(36).substr(2, 9));
        } else if (cleanNumber.startsWith('5')) {
          resolve('master_token_' + Math.random().toString(36).substr(2, 9));
        } else {
          reject(new Error('Bandeira não suportada'));
        }
      }, 1000);
    });
  };

  // Função para processar pagamento com cartão
  const handleCardPayment = async () => {
    if (!validateCard()) {
      alert('Por favor, corrija os erros no formulário do cartão.');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Tokenizar o cartão
      const cardToken = await getCardToken();

      // 2. Criar pagamento no Mercado Pago
      const payload = {
        transaction_amount: parseFloat(total.toFixed(2)),
        token: cardToken,
        description: `Pedido com ${totalItems} itens - Chico Cosméticos`,
        installments: cardData.installments, // Já é number
        payment_method_id: cardData.number.startsWith('4') ? 'visa' : 'master',
        payer: {
          email: email.trim(),
          identification: {
            type: 'CPF',
            number: '12345678909' // Em produção, coletar do usuário
          }
        },
        metadata: {
          total_items: totalItems,
          subtotal: parseFloat(subtotal.toFixed(2)),
          discount: parseFloat(discount.toFixed(2)),
          delivery_method: deliveryMethod,
          address: deliveryMethod === 'entrega' ? address.trim() : 'Retirada',
          items: cartItems.map(item => ({
            product_id: item.product.id,
            product_name: item.product.name,
            quantity: item.quantity,
            price: parseFloat(item.product.price.toFixed(2))
          }))
        }
      };

      console.log('📤 Enviando pagamento com cartão...', payload);

      const response = await fetch('/api/mercadopago/criarPagamento', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Erro na API:', data);
        throw new Error(data.message || data.error || 'Erro ao processar pagamento');
      }

      console.log('✅ Resposta do pagamento com cartão:', data);

      if (data.status === 'approved') {
        // Pagamento aprovado
        const orderDetails: OrderDetails = {
          product: cartItems[0]?.product || { id: 0, name: 'Produto', price: 0, description: '', image: '' },
          paymentMethod: 'cartao',
          deliveryMethod,
          address: deliveryMethod === 'entrega' ? address : undefined,
          paymentStatus: 'approved',
          paymentId: data.id,
          cartSummary: {
            items: cartItems,
            subtotal,
            discount,
            total,
            totalItems
          }
        };

        console.log('✅ Pedido aprovado com cartão:', orderDetails);
        clearCart();
        alert('🎉 Pagamento aprovado! Pedido confirmado com sucesso.');
        onClose();

      } else if (data.status === 'pending' || data.status === 'in_process') {
        // Pagamento pendente
        const orderDetails: OrderDetails = {
          product: cartItems[0]?.product || { id: 0, name: 'Produto', price: 0, description: '', image: '' },
          paymentMethod: 'cartao',
          deliveryMethod,
          address: deliveryMethod === 'entrega' ? address : undefined,
          paymentStatus: data.status as 'pending' | 'approved' | 'rejected',
          paymentId: data.id,
          cartSummary: {
            items: cartItems,
            subtotal,
            discount,
            total,
            totalItems
          }
        };

        console.log('⏳ Pagamento pendente:', orderDetails);
        alert('⏳ Pagamento em processamento. Você receberá uma confirmação por email.');

      } else {
        throw new Error(`Pagamento não aprovado. Status: ${data.status}`);
      }

    } catch (error) {
      console.error('💥 Erro no pagamento com cartão:', error);
      alert(`Erro no pagamento: ${error instanceof Error ? error.message : 'Tente novamente'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Função para processar pagamento com Mercado Pago
  const handleMercadoPagoPayment = async () => {
    if (!email.trim()) {
      alert('Por favor, informe seu email.');
      return;
    }

    if (deliveryMethod === 'entrega' && !address.trim()) {
      alert('Por favor, informe o endereço de entrega.');
      return;
    }

    // Para cartão, usar a função específica
    if (paymentMethod === 'cartao') {
      await handleCardPayment();
      return;
    }

    setIsProcessing(true);

    try {
      const payload: any = {
        transaction_amount: parseFloat(total.toFixed(2)),
        description: `Pedido com ${totalItems} itens - Chico Cosméticos`,
        payer: {
          email: email.trim(),
        },
        metadata: {
          total_items: totalItems,
          subtotal: parseFloat(subtotal.toFixed(2)),
          discount: parseFloat(discount.toFixed(2)),
          delivery_method: deliveryMethod,
          address: deliveryMethod === 'entrega' ? address.trim() : 'Retirada',
          items: cartItems.map(item => ({
            product_id: item.product.id,
            product_name: item.product.name,
            quantity: item.quantity,
            price: parseFloat(item.product.price.toFixed(2))
          }))
        }
      };

      // Configuração específica para PIX
      if (paymentMethod === 'pix') {
        payload.payment_method_id = 'pix';
        payload.date_of_expiration = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      }

      console.log('📤 Enviando pagamento para API...', payload);

      const response = await fetch('/api/mercadopago/criarPagamento', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Erro da API:', data);
        throw new Error(data.message || data.error || 'Erro ao criar pagamento');
      }

      console.log('✅ Resposta do Mercado Pago:', data);

      if (data.status === 'pending' || data.status === 'in_process' || data.status === 'approved') {

        // Se for PIX, mostrar QR Code
        if (paymentMethod === 'pix' && data.point_of_interaction?.transaction_data) {
          setQrCode(data.point_of_interaction.transaction_data.qr_code_base64);
          setPaymentUrl(data.point_of_interaction.transaction_data.ticket_url);

          const orderDetails: OrderDetails = {
            product: cartItems[0]?.product || { id: 0, name: 'Produto', price: 0, description: '', image: '' },
            paymentMethod,
            deliveryMethod,
            address: deliveryMethod === 'entrega' ? address : undefined,
            paymentStatus: data.status as 'pending' | 'approved' | 'rejected',
            paymentId: data.id,
            cartSummary: {
              items: cartItems,
              subtotal,
              discount,
              total,
              totalItems
            }
          };

          console.log('✅ Pedido criado com PIX:', orderDetails);
          alert('💰 QR Code PIX gerado! Escaneie para pagar.');

        } else if (data.status === 'approved') {
          // Pagamento aprovado instantaneamente
          const orderDetails: OrderDetails = {
            product: cartItems[0]?.product || { id: 0, name: 'Produto', price: 0, description: '', image: '' },
            paymentMethod,
            deliveryMethod,
            address: deliveryMethod === 'entrega' ? address : undefined,
            paymentStatus: 'approved',
            paymentId: data.id,
            cartSummary: {
              items: cartItems,
              subtotal,
              discount,
              total,
              totalItems
            }
          };

          console.log('✅ Pedido aprovado:', orderDetails);
          clearCart();
          alert('🎉 Pagamento aprovado! Pedido confirmado com sucesso.');
          onClose();
        }

      } else {
        throw new Error(`Status de pagamento inesperado: ${data.status}`);
      }

    } catch (error) {
      console.error('💥 Erro no pagamento:', error);
      alert(`Erro: ${error instanceof Error ? error.message : 'Tente novamente'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Função para pagamento em dinheiro - APENAS RETIRADA
  const handleCashPayment = () => {
    if (!email.trim()) {
      alert('Por favor, informe seu email.');
      return;
    }

    // Para dinheiro, forçar retirada
    if (deliveryMethod === 'entrega') {
      alert('Para pagamento em dinheiro, apenas retirada no local está disponível.');
      setDeliveryMethod('retirada');
      return;
    }

    const orderDetails: OrderDetails = {
      product: cartItems[0]?.product || { id: 0, name: 'Produto', price: 0, description: '', image: '' },
      paymentMethod: 'dinheiro',
      deliveryMethod: 'retirada',
      paymentStatus: 'pending',
      cartSummary: {
        items: cartItems,
        subtotal,
        discount,
        total,
        totalItems
      }
    };

    console.log('✅ Pedido em dinheiro:', orderDetails);
    clearCart();
    alert('🎉 Pedido confirmado! Pagamento será realizado na retirada.');
    onClose();
  };

  // Função principal de confirmação de pagamento
  const handlePaymentConfirm = async () => {
    if (paymentMethod === 'dinheiro') {
      handleCashPayment();
    } else {
      await handleMercadoPagoPayment();
    }
  };

  // Função do WhatsApp (alternativa)
  const handleConfirmPurchaseWhatsApp = () => {
    const whatsappNumber = "14991114764";

    let message = `🛒 *PEDIDO - Chico Cosméticos*\n\n`;
    message += `*Itens do Pedido:*\n`;

    cartItems.forEach((item, index) => {
      message += `${index + 1}. ${item.product.name} - ${item.quantity}x R$ ${item.product.price.toFixed(2)}\n`;
    });

    message += `\n*Resumo do Pedido:*\n`;
    message += `📦 Itens: ${totalItems}\n`;
    message += `💰 Subtotal: R$ ${subtotal.toFixed(2)}\n`;
    if (discount > 0) {
      message += `🎁 Desconto (10%): -R$ ${discount.toFixed(2)}\n`;
    }
    message += `💵 *Total: R$ ${total.toFixed(2)}*\n\n`;
    message += `Por favor, confirme meu pedido!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        {/* Header do Modal */}
        <div className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <h2>Finalizar Compra</h2>
            <button className={styles.closeButton} onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          {/* Navegação Elegante com Bolas e Linha */}
          <div className={styles.elegantNavigation}>
            <div className={styles.navigationSteps}>
              {/* Passo 1 - Carrinho */}
              <div
                className={`${styles.step} ${currentView === 'carrinho' ? styles.active : ''} ${currentView === 'pagamento' ? styles.completed : ''}`}
                onClick={() => setCurrentView('carrinho')}
              >
                <div className={styles.stepCircle}>
                  {currentView === 'pagamento' ? (
                    <Check size={16} />
                  ) : (
                    <ShoppingCart size={16} />
                  )}
                </div>
                <span className={styles.stepLabel}>Carrinho</span>
              </div>

              {/* Linha conectora */}
              <div className={styles.stepLine}></div>

              {/* Passo 2 - Pagamento */}
              <div
                className={`${styles.step} ${currentView === 'pagamento' ? styles.active : ''}`}
                onClick={() => cartItems.length > 0 && setCurrentView('pagamento')}
              >
                <div className={styles.stepCircle}>
                  <CreditCard size={16} />
                </div>
                <span className={styles.stepLabel}>Pagamento</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.modalContent}>
          {currentView === 'carrinho' ? (
            /* VIEW DO CARRINHO */
            <div className={styles.twoColumnLayout}>

              {/* COLUNA ESQUERDA - Lista de Produtos */}
              <div className={styles.leftColumn}>

                {/* Lista de Itens no Carrinho */}
                <div className={styles.cartItemsSection}>
                  <h3>Seus Produtos ({totalItems} {totalItems === 1 ? 'item' : 'itens'})</h3>
                  {cartItems.length === 0 ? (
                    <div className={styles.emptyCart}>
                      <div className={styles.emptyCartIcon}>🛒</div>
                      <p>Seu carrinho está vazio</p>
                      <span>Adicione produtos incríveis! ✨</span>
                    </div>
                  ) : (
                    <div className={styles.itemsList}>
                      {cartItems.map((item) => (
                        <div key={item.product.id} className={styles.cartItem}>
                          <div className={styles.itemImageContainer}>
                            <Image
                              src={item.product.image}
                              alt={item.product.name}
                              className={styles.itemImage}
                              width={80}
                              height={80}
                            />
                          </div>

                          <div className={styles.itemDetails}>
                            <h4>{item.product.name}</h4>
                            <p className={styles.itemDescription}>{item.product.description}</p>
                            <div className={styles.itemPrice}>
                              R$ {item.product.price.toFixed(2)}
                            </div>
                          </div>

                          <div className={styles.itemControls}>
                            <div className={styles.quantityControls}>
                              <button
                                onClick={() => decreaseQuantity(item.product.id)}
                                className={styles.quantityBtn}
                              >
                                <Minus size={16} />
                              </button>
                              <span className={styles.quantity}>{item.quantity}</span>
                              <button
                                onClick={() => increaseQuantity(item.product)}
                                className={styles.quantityBtn}
                              >
                                <Plus size={16} />
                              </button>
                            </div>

                            <div className={styles.itemTotal}>
                              R$ {(item.product.price * item.quantity).toFixed(2)}
                            </div>

                            <div className={styles.itemActions}>
                              <button
                                onClick={() => saveForLater(item)}
                                className={styles.saveBtn}
                                title="Salvar para depois"
                              >
                                <Heart size={16} />
                              </button>
                              <button
                                onClick={() => removeItem(item.product.id)}
                                className={styles.removeBtn}
                                title="Remover item"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Itens Salvos para Depois */}
                {savedItems.length > 0 && (
                  <div className={styles.savedItemsSection}>
                    <h3>💝 Salvos para Depois</h3>
                    <div className={styles.savedItemsList}>
                      {savedItems.map((item) => (
                        <div key={item.product.id} className={styles.savedItem}>
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            className={styles.savedImage}
                            width={60}
                            height={60}
                          />
                          <div className={styles.savedDetails}>
                            <h5>{item.product.name}</h5>
                            <span>R$ {item.product.price.toFixed(2)}</span>
                          </div>
                          <div className={styles.savedActions}>
                            <button
                              onClick={() => moveToCart(item)}
                              className={styles.moveToCartBtn}
                            >
                              Mover para Carrinho
                            </button>
                            <button
                              onClick={() => removeSaved(item.product.id)}
                              className={styles.removeSavedBtn}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Produtos Relacionados */}
                <div className={styles.relatedProductsSection}>
                  <h3>🔥 Você também pode gostar</h3>
                  <div className={styles.relatedProductsGrid}>
                    {relatedProducts.map((product) => (
                      <div key={product.id} className={styles.relatedProduct}>
                        <Image
                          src={product.image}
                          alt={product.name}
                          className={styles.relatedImage}
                          width={70}
                          height={70}
                        />
                        <div className={styles.relatedDetails}>
                          <h5>{product.name}</h5>
                          <span className={styles.relatedPrice}>
                            R$ {product.price.toFixed(2)}
                          </span>
                          <button
                            onClick={() => addToCart(product)}
                            className={styles.addRelatedBtn}
                          >
                            Adicionar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* COLUNA DIREITA - Resumo e Estatísticas */}
              <div className={styles.rightColumn}>
                <div className={styles.summaryCard}>
                  <h3>📊 Resumo do Pedido</h3>

                  <div className={styles.summaryItem}>
                    <span>Itens no carrinho:</span>
                    <span>{totalItems}</span>
                  </div>

                  <div className={styles.summaryItem}>
                    <span>Subtotal:</span>
                    <span>R$ {subtotal.toFixed(2)}</span>
                  </div>

                  {discount > 0 && (
                    <div className={styles.summaryItem}>
                      <span>🎁 Desconto (10%):</span>
                      <span className={styles.discount}>-R$ {discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className={styles.summaryItem}>
                    <span>Frete:</span>
                    <span className={styles.freeShipping}>Grátis</span>
                  </div>

                  <div className={styles.total}>
                    <span>Total a Pagar:</span>
                    <span className={styles.totalPrice}>R$ {total.toFixed(2)}</span>
                  </div>

                  {/* Estatísticas */}
                  <div className={styles.stats}>
                    <div className={styles.statItem}>
                      <span>💰 Economia total:</span>
                      <span>R$ {discount.toFixed(2)}</span>
                    </div>
                    {subtotal < 100 && (
                      <div className={styles.promoAlert}>
                        🎊 Adicione R$ {(100 - subtotal).toFixed(2)} e ganhe 10% de desconto!
                      </div>
                    )}
                  </div>

                  {/* Ações */}
                  <div className={styles.actions}>
                    {/* Botão PRINCIPAL - Vai para pagamento */}
                    <button
                      className={styles.confirmButton}
                      onClick={handleGoToPayment}
                      disabled={cartItems.length === 0}
                    >
                      <CreditCard size={20} />
                      Continuar para Pagamento
                    </button>

                    {/* Botão WhatsApp (alternativo) */}
                    <button
                      className={styles.whatsappButton}
                      onClick={handleConfirmPurchaseWhatsApp}
                      disabled={cartItems.length === 0}
                    >
                      📱 Pedir por WhatsApp
                    </button>

                    <button
                      className={styles.continueShopping}
                      onClick={onClose}
                    >
                      🛍️ Continuar Comprando
                    </button>

                    {cartItems.length > 0 && (
                      <button
                        className={styles.clearCart}
                        onClick={clearCart}
                      >
                        🗑️ Limpar Carrinho
                      </button>
                    )}
                  </div>

                  {/* Informações de Pagamento */}
                  <div className={styles.paymentInfo}>
                    <h4>💳 Formas de Pagamento</h4>
                    <div className={styles.paymentMethods}>
                      <span>• PIX (Pagamento instantâneo)</span>
                      <span>• Cartão de Crédito</span>
                      <span>• Cartão de Débito</span>
                      <span>• Dinheiro (na entrega)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* VIEW DO PAGAMENTO - DENTRO DO MESMO MODAL */
            <div className={styles.paymentView}>
              <div className={styles.paymentHeader}>
                <button className={styles.backButton} onClick={handleBackToCart}>
                  <ArrowLeft size={20} />
                  Voltar ao Carrinho
                </button>
              </div>

              <div className={styles.paymentLayout}>
                {/* Coluna Esquerda - Resumo do Pedido */}
                <div className={styles.paymentLeftColumn}>
                  <div className={styles.orderSummary}>
                    <h3>📦 Resumo do Pedido</h3>
                    <div className={styles.summaryItems}>
                      <div className={styles.summaryItem}>
                        <span>Itens no carrinho:</span>
                        <span>{totalItems}</span>
                      </div>
                      <div className={styles.summaryItem}>
                        <span>Subtotal:</span>
                        <span>R$ {subtotal.toFixed(2)}</span>
                      </div>
                      {discount > 0 && (
                        <div className={styles.summaryItem}>
                          <span>🎁 Desconto (10%):</span>
                          <span className={styles.discount}>-R$ {discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className={styles.summaryTotal}>
                        <span>Total a Pagar:</span>
                        <span className={styles.totalPrice}>R$ {total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Informações de Entrega */}
                  <div className={styles.deliverySection}>
                    <h4>🚚 Tipo de Entrega</h4>
                    <div className={styles.options}>
                      <label className={styles.option}>
                        <input
                          type="radio"
                          name="delivery"
                          value="retirada"
                          checked={deliveryMethod === 'retirada'}
                          onChange={(e) => setDeliveryMethod(e.target.value as 'retirada')}
                          disabled={isProcessing}
                        />
                        <span className={styles.optionText}>
                          <strong>Retirada no Local</strong>
                          <small>Grátis - Endereço da loja</small>
                        </span>
                      </label>

                      <label className={styles.option}>
                        <input
                          type="radio"
                          name="delivery"
                          value="entrega"
                          checked={deliveryMethod === 'entrega'}
                          onChange={(e) => setDeliveryMethod(e.target.value as 'entrega')}
                          disabled={isProcessing || paymentMethod === 'dinheiro'}
                        />
                        <span className={styles.optionText}>
                          <strong>Entrega em Domicílio</strong>
                          <small>Taxa de entrega conforme localização</small>
                        </span>
                      </label>
                    </div>

                    {deliveryMethod === 'entrega' && paymentMethod !== 'dinheiro' && (
                      <div className={styles.addressField}>
                        <label>Endereço de Entrega:</label>
                        <textarea
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Digite seu endereço completo..."
                          rows={3}
                          disabled={isProcessing}
                          className={styles.addressInput}
                        />
                      </div>
                    )}

                    {/* Mensagem para dinheiro - apenas retirada */}
                    {paymentMethod === 'dinheiro' && (
                      <div className={styles.cashInfo}>
                        <p>💰 Para pagamento em dinheiro, apenas retirada no local está disponível.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Coluna Direita - Forma de Pagamento */}
                <div className={styles.paymentRightColumn}>
                  <div className={styles.paymentMethods}>
                    <h3>💳 Forma de Pagamento</h3>

                    {/* Campo de Email */}
                    <div className={styles.paymentEmailField}>
                      <label>Email para recebimento do comprovante:</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        disabled={isProcessing}
                        className={styles.paymentEmailInput}
                      />
                    </div>

                    <div className={styles.paymentOptions}>
                      <label className={styles.option}>
                        <input
                          type="radio"
                          name="payment"
                          value="pix"
                          checked={paymentMethod === 'pix'}
                          onChange={(e) => setPaymentMethod(e.target.value as 'pix')}
                          disabled={isProcessing}
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
                          disabled={isProcessing}
                        />
                        <span className={styles.optionText}>
                          <strong>Cartão de Crédito/Débito</strong>
                          <small>Pagamento seguro</small>
                        </span>
                      </label>

                      <label className={styles.option}>
                        <input
                          type="radio"
                          name="payment"
                          value="dinheiro"
                          checked={paymentMethod === 'dinheiro'}
                          onChange={(e) => setPaymentMethod(e.target.value as 'dinheiro')}
                          disabled={isProcessing}
                        />
                        <span className={styles.optionText}>
                          <strong>Dinheiro</strong>
                          <small>Apenas retirada no local</small>
                        </span>
                      </label>
                    </div>

                    {/* Formulário do Cartão */}
                    {paymentMethod === 'cartao' && (
                      <div className={styles.cardForm}>
                        <h5>Dados do Cartão</h5>

                        <div className={styles.formRow}>
                          <div className={styles.formGroup}>
                            <label>Número do Cartão</label>
                            <input
                              type="text"
                              value={cardData.number}
                              onChange={(e) => handleCardChange('number', e.target.value)}
                              placeholder="0000 0000 0000 0000"
                              disabled={isProcessing}
                              className={cardErrors.number ? styles.error : ''}
                            />
                            {cardErrors.number && <span className={styles.errorText}>{cardErrors.number}</span>}
                          </div>
                        </div>

                        <div className={styles.formRow}>
                          <div className={styles.formGroup}>
                            <label>Nome no Cartão</label>
                            <input
                              type="text"
                              value={cardData.name}
                              onChange={(e) => handleCardChange('name', e.target.value)}
                              placeholder="JOÃO M SILVA"
                              disabled={isProcessing}
                              className={cardErrors.name ? styles.error : ''}
                            />
                            {cardErrors.name && <span className={styles.errorText}>{cardErrors.name}</span>}
                          </div>
                        </div>

                        <div className={styles.formRow}>
                          <div className={styles.formGroup}>
                            <label>Validade</label>
                            <input
                              type="text"
                              value={cardData.expiry}
                              onChange={(e) => handleCardChange('expiry', e.target.value)}
                              placeholder="MM/AA"
                              disabled={isProcessing}
                              className={cardErrors.expiry ? styles.error : ''}
                            />
                            {cardErrors.expiry && <span className={styles.errorText}>{cardErrors.expiry}</span>}
                          </div>

                          <div className={styles.formGroup}>
                            <label>CVC</label>
                            <input
                              type="text"
                              value={cardData.cvc}
                              onChange={(e) => handleCardChange('cvc', e.target.value)}
                              placeholder="123"
                              disabled={isProcessing}
                              className={cardErrors.cvc ? styles.error : ''}
                            />
                            {cardErrors.cvc && <span className={styles.errorText}>{cardErrors.cvc}</span>}
                          </div>

                          <div className={styles.formGroup}>
                            <label>Parcelas</label>
                            <select
                              value={cardData.installments}
                              onChange={(e) => handleInstallmentsChange(e.target.value)}
                              disabled={isProcessing}
                              className={cardErrors.installments ? styles.error : ''}
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                                <option key={num} value={num}>
                                  {num}x de R$ {(total / num).toFixed(2)}
                                </option>
                              ))}
                            </select>
                            {cardErrors.installments && <span className={styles.errorText}>{cardErrors.installments}</span>}
                          </div>
                        </div>

                        <div className={styles.cardSecurity}>
                          <span>🔒 Pagamento 100% seguro via Mercado Pago</span>
                        </div>
                      </div>
                    )}

                    {/* QR Code PIX */}
                    {paymentMethod === 'pix' && qrCode && (
                      <div className={styles.pixSection}>
                        <h5>Pagamento PIX</h5>
                        <img
                          src={`data:image/png;base64,${qrCode}`}
                          alt="QR Code PIX"
                          className={styles.qrCode}
                        />
                        <p>Escaneie o QR Code com seu app bancário</p>
                        {paymentUrl && (
                          <a href={paymentUrl} target="_blank" rel="noopener noreferrer" className={styles.paymentLink}>
                            📱 Abrir comprovante PIX
                          </a>
                        )}
                      </div>
                    )}

                    {/* Status do processamento */}
                    {isProcessing && (
                      <div className={styles.processing}>
                        <div className={styles.loadingSpinner}></div>
                        <p>Processando pagamento...</p>
                      </div>
                    )}

                    {/* Botão de Confirmação */}
                    <div className={styles.paymentActions}>
                      <button
                        className={styles.confirmButton}
                        onClick={handlePaymentConfirm}
                        disabled={
                          isProcessing ||
                          !email.trim() ||
                          (deliveryMethod === 'entrega' && !address.trim() && paymentMethod !== 'dinheiro') ||
                          (paymentMethod === 'pix' && !!qrCode) ||
                          (paymentMethod === 'cartao' && Object.keys(cardErrors).length > 0)
                        }
                      >
                        {isProcessing ? (
                          <>
                            <div className={styles.buttonSpinner}></div>
                            Processando...
                          </>
                        ) : paymentMethod === 'dinheiro' ? (
                          <>
                            <ShoppingCart size={16} />
                            Confirmar Pedido
                          </>
                        ) : paymentMethod === 'pix' && qrCode ? (
                          <>
                            <span>✅</span>
                            QR Code Gerado
                          </>
                        ) : (
                          <>
                            <span>💰</span>
                            {paymentMethod === 'pix' ? 'Gerar QR Code PIX' : 'Pagar com Cartão'}
                          </>
                        )}
                      </button>
                    </div>

                    {/* Mensagem para dinheiro */}
                    {paymentMethod === 'dinheiro' && !isProcessing && (
                      <div className={styles.cashInfo}>
                        <p>💰 Pagamento será realizado no momento da retirada</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalCarrinho;