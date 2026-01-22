"use client";

import { SidebarProvider, SidebarInset } from "@repo/common-ui";
import { AppSidebar } from "@/components/layout/sidebar";
import { Toaster } from "@repo/common-ui";

const Layout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="flex flex-col min-h-screen w-full overflow-auto">
                {children}
                <Toaster />
            </SidebarInset>
        </SidebarProvider>
    );
};

export default Layout;

