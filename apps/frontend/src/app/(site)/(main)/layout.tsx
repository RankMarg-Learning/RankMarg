
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
      <div >
        {children}
      </div>
      <MobileTabBar />
    </>
  );
};

export default Layout;