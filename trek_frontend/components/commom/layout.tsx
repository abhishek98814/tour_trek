'use client';
import Navbar from '@/components/commom/Navbar';
import Footer from '@/components/commom/Footer';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen flex-1" style={{ paddingTop: '68px' }}>
        {children}
      </main>
      <Footer />
    </>
  );
}