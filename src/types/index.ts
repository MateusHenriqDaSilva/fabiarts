export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: 'resina' | 'madeira' | 'mesa';
  description: string;
}

export interface OrderDetails {
  product: Product;
  paymentMethod: 'pix' | 'dinheiro' | 'cartao';
  deliveryMethod: 'retirada' | 'entrega';
  address?: string;
}