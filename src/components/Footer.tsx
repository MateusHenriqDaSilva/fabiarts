import React from 'react';
import styles from '@/styles/Footer.module.css';

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerColumns}>
          {/* Coluna 1 - Informações da empresa */}
          <div className={styles.footerColumn}>
            <h4 className={styles.columnTitle}>Fabiarts</h4>
            <p className={styles.companyInfo}>
              Produtos artesanais exclusivos em resina, madeira e mesas.
            </p>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <span>📧</span>
                <span>fabianahn97@gmail.com</span>
              </div>
              <div className={styles.contactItem}>
                <span>📱</span>
                <span>(11) 98806-8948</span>
              </div>
              <div className={styles.contactItem}>
                <span>🕒</span>
                <span>Seg - Sex: 9h às 17h</span>
              </div>
            </div>
          </div>

          {/* Coluna 2 - Direitos e localização */}
          <div className={styles.footerColumn}>
            <h4 className={styles.columnTitle}>Localização</h4>
            <p className={styles.address}>
              Residencial Albuquerque Lins 10-54
            </p>
            <div className={styles.copyrightSection}>
              <p className={styles.copyright}>
                &copy; {new Date().getFullYear()} Fabiarts
              </p>
              <p className={styles.rights}>
                Todos os direitos reservados
              </p>
              <p className={styles.development}>
                Desenvolvimento: Mahends
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;