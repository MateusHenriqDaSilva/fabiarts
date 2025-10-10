import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fabiarts - Produtos Artesanais',
  description: 'Produtos artesanais em resina, madeira e mesas',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}