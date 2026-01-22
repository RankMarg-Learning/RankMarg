
"use client"
import React from 'react';
import { MobileTabBar } from '@/components/MobileTabBar';

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <>
      <div className="w-full px-4 py-6 md:px-6 lg:px-8 pb-20 lg:pb-6">
        {children}
      </div>
      {/* Mobile Tab Bar - Only visible on mobile */}
      <MobileTabBar />
    </>
  );
};

export default Layout;