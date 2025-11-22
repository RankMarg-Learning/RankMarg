
"use client"
import React, {  useEffect } from 'react';
import { cn } from '@/lib/utils';
import Footer from "@/components/Footer";
import { Toaster } from "@repo/common-ui";
import { usePathname } from 'next/navigation';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { useUserData } from '@/context/ClientContextProvider';

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const { mobileMenuOpen, setMobileMenuOpen } = useUserData();
  const location = usePathname();

  // Close mobile menu when route changes
  useEffect(() => { 
    setMobileMenuOpen(false);
  }, [location]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-subtle-gray ">
      <Header onMenuClick={toggleMobileMenu} />
      <div className="flex flex-1 relative">
        {/* Mobile Overlay - only shown on mobile when menu is open */}
        <div 
          className={cn(
            "fixed inset-0 bg-black/20 z-30 lg:hidden transition-opacity duration-300",
            mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setMobileMenuOpen(false)}
        />
        
        {/* Sidebar - responsive visibility */}
        <Sidebar
          className={cn(
            // Desktop: always visible, positioned normally
            "hidden lg:block",
            // Mobile: show when menu is open, positioned fixed
            mobileMenuOpen && "block lg:hidden fixed left-0 top-16 bottom-0 shadow-xl z-40"
          )}
        />

        {/* Main content */}
        <main className="flex-1 container py-4 px-2 md:py-6 md:px-6">
          {children}
          <Toaster />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;