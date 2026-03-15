
"use client"
import React from 'react';
import { MobileTabBar } from '@/components/MobileTabBar';
import { AppDownloadBanner } from '@/components/AppDownloadBanner';

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
      <AppDownloadBanner hasTabBar />
      <MobileTabBar />
    </>
  );
};

export default Layout;