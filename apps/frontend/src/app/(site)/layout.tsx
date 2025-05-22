"use client"
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import { usePathname } from 'next/navigation';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';




const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = usePathname();

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  return (
      <div className="min-h-screen flex flex-col bg-subtle-gray">
      <Header onMenuClick={toggleMobileMenu} />
      <div className="flex flex-1 relative">
        {/* Mobile Overlay */}
        {mobileMenuOpen && isMobile && (
          <div 
            className="fixed inset-0 bg-black/20 z-30 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        {(!isMobile || mobileMenuOpen) && (
          <Sidebar
          isMobile={isMobile}
            className={cn(
              isMobile && mobileMenuOpen && "fixed left-0 top-16 bottom-0 shadow-xl"
            )}
          />
        )}

        {/* Main content */}
        <main className="flex-1 container py-4 px-3 md:py-6 md:px-6">
          {children}
          <Toaster />
        </main>
      </div>
          <Footer />
    </div>
  );
};

export default Layout;