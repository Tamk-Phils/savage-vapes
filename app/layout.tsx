import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CartProvider } from '@/lib/cart-context';
import { AuthProvider } from '@/lib/auth-context';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import AgeVerificationModal from '@/components/AgeVerificationModal';
import AuthModal from '@/components/AuthModal';
import LiveChatWidget from '@/components/LiveChatWidget';
import ServiceWorkerCleanup from '@/components/ServiceWorkerCleanup';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'Vape Well Australia - Buy Vapes Online Australia | Best Disposable Vape Store',
  description: 'Buy Disposable Vapes Online in Australia at Vape Well Australia. Huge range of authentic IGET, HQD, ALIBARBAR, RELX, VEIPUS OPAL pods, vape kits, and coils with express discreet delivery Australia-wide.',
  keywords: 'vape well australia, buy vapes online australia, disposable vapes australia, iget vapes australia, hqd vapes australia, vape store australia, alibarbar vapes, relx pods australia, cheap vapes online, sydney vapes, melbourne vapes',
  openGraph: {
    title: 'Vape Well Australia - Buy Vapes Online Australia',
    description: 'Australia’s trusted online vape store for authentic disposable vapes, replacement pods, and starter kits with fast discreet shipping.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#f5f5f5] text-[#3a3a3a] antialiased selection:bg-[#45cab4] selection:text-black">
        <ServiceWorkerCleanup />
        <AuthProvider>
          <CartProvider>
            <AgeVerificationModal />
            <Header />
            <CartDrawer />
            <AuthModal />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <LiveChatWidget />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

