'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ProductCarousel from '@/components/ProductCarousel';
import CategoryMenu from '@/components/CategoryMenu';
import ProductGrid from '@/components/ProductGrid';
import Footer from '@/components/Footer';
import { Product } from '@/types';

// Dados mockados dos produtos
const mockProducts: Product[] = [
  // Produtos de Resina
  { id: 1, name: 'Porta-joias Resina', price: 89.90, category: 'resina', image: '/resina/resina1.jpg', description: 'Lindo porta-joias em resina artesanal' },
  { id: 2, name: 'Abajur Resina', price: 149.90, category: 'resina', image: '/resina/resina2.jpg', description: 'Abajur decorativo em resina' },
  { id: 3, name: 'Bandija Resina', price: 79.90, category: 'resina', image: '/resina/resina3.jpg', description: 'Bandija decorativa em resina' },
  { id: 4, name: 'Porta-retrato Resina', price: 59.90, category: 'resina', image: '/resina/resina4.jpg', description: 'Porta-retrato em resina personalizado' },
  { id: 5, name: 'Vaso Resina', price: 99.90, category: 'resina', image: '/resina/resina5.jpg', description: 'Vaso decorativo em resina' },
  { id: 6, name: 'Cubo Resina', price: 69.90, category: 'resina', image: '/resina/resina6.jpg', description: 'Cubo decorativo em resina' },
  
  // Produtos de Madeira
  { id: 7, name: 'Cadeira Madeira', price: 299.90, category: 'madeira', image: '/madeiras/madeira1.jpg', description: 'Cadeira rústica em madeira maciça' },
  { id: 8, name: 'Mesa Centro Madeira', price: 199.90, category: 'madeira', image: '/madeiras/madeira2.jpg', description: 'Mesa de centro em madeira natural' },
  { id: 9, name: 'Prateleira Madeira', price: 129.90, category: 'madeira', image: '/madeiras/madeira3.jpg', description: 'Prateleira decorativa em madeira' },
  { id: 10, name: 'Porta-chapéu Madeira', price: 159.90, category: 'madeira', image: '/madeiras/madeira4.jpg', description: 'Cabideiro porta-chapéu em madeira' },
  { id: 11, name: 'Banco Madeira', price: 179.90, category: 'madeira', image: '/madeiras/madeira5.jpg', description: 'Banco rústico em madeira' },
  { id: 12, name: 'Painel Madeira', price: 249.90, category: 'madeira', image: '/madeiras/madeira6.jpg', description: 'Painel decorativo em madeira' },
  
  // Produtos de Mesa
  { id: 13, name: 'Mesa Jantar', price: 899.90, category: 'mesa', image: '/mesa/mesa1.jpg', description: 'Mesa de jantar 6 lugares' },
  { id: 14, name: 'Mesa Escritório', price: 699.90, category: 'mesa', image: '/mesa/mesa2.jpg', description: 'Mesa para escritório em madeira' },
  { id: 15, name: 'Mesa Lateral', price: 199.90, category: 'mesa', image: '/mesa/mesa3.jpg', description: 'Mesa lateral decorativa' },
  { id: 16, name: 'Mesa Rustica', price: 799.90, category: 'mesa', image: '/mesa/mesa4.jpg', description: 'Mesa rústica em madeira maciça' },
  { id: 17, name: 'Mesa Redonda', price: 499.90, category: 'mesa', image: '/mesa/mesa5.jpg', description: 'Mesa redonda para sala' },
  { id: 18, name: 'Mesa Dobrável', price: 299.90, category: 'mesa', image: '/mesa/mesa6.jpg', description: 'Mesa dobrável prática' },
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<'resina' | 'madeira' | 'mesa'>('resina');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Filtrar produtos pela categoria ativa
    const filtered = mockProducts.filter(product => product.category === activeCategory);
    setFilteredProducts(filtered);
  }, [activeCategory]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <ProductCarousel />
        <CategoryMenu 
          activeCategory={activeCategory} 
          onCategoryChange={setActiveCategory} 
        />
        <ProductGrid products={filteredProducts} />
      </main>
      <Footer />
    </div>
  );
}