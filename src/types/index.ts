// Em '@/types/index.ts'

// Primeiro defina o tipo das categorias
export type ProductCategory = 'resina' | 'madeira' | 'mesa';

export interface Product {
  id: number;
  name: string;
  image: string;
  price: number;
  category: ProductCategory; // ← Use o tipo definido (não opcional)
  description: string;
}

export interface CategoryMenuProps {
  activeCategory: ProductCategory;
  onCategoryChange: (category: ProductCategory) => void;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  totalItems: number;
}

export interface MercadoPagoPayment {
  id: string;
  status: string;
  status_detail: string;
  transaction_amount: number;
  point_of_interaction?: {
    transaction_data?: {
      qr_code: string;
      qr_code_base64: string;
      ticket_url: string;
    };
  };
}

export interface OrderDetails {
  product: Product;
  paymentMethod: 'pix' | 'dinheiro' | 'cartao';
  deliveryMethod: 'retirada' | 'entrega';
  address?: string;
  paymentStatus?: 'pending' | 'approved' | 'rejected';
  paymentId?: string;
  cartSummary?: CartSummary;
}

// Atualizar também a interface do CategoryMenu para usar o tipo correto
export interface CategoryMenuProps {
  activeCategory: ProductCategory;
  onCategoryChange: (category: ProductCategory) => void;
}