
"use client"
import React from 'react';

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

        </>
    );
};

export default Layout;