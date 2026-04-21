import type { Metadata } from 'next';
import { CartProvider } from './components/cart/CartProvider';
import '../styles/index.css';

export const metadata: Metadata = {
  title: 'Élanoire Beauty UK',
  description: 'Luxury skincare and makeup crafted for modern beauty rituals.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
