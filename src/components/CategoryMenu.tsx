'use client';

import React from 'react';
import styles from '@/styles/CategoryMenu.module.css';

interface CategoryMenuProps {
  activeCategory: 'resina' | 'madeira' | 'mesa';
  onCategoryChange: (category: 'resina' | 'madeira' | 'mesa') => void;
}

const CategoryMenu: React.FC<CategoryMenuProps> = ({ 
  activeCategory, 
  onCategoryChange 
}) => {
  const categories = [
    { id: 'resina' as const, name: 'Resina' },
    { id: 'madeira' as const, name: 'Madeira' },
    { id: 'mesa' as const, name: 'Mesa' },
  ];

  return (
    <section className={styles.categorySection}>
      {/* REMOVI a div com styles.container que não existe */}
      <h2 className={styles.title}>Nossas Categorias</h2>
      <div className={styles.categoriesContainer}>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`${styles.categoryButton} ${
              activeCategory === category.id ? styles.activeCategory : styles.inactiveCategory
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </section>
  );
};

export default CategoryMenu;