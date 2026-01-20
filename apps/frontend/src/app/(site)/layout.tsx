"use client";

import { Button } from "@repo/common-ui";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const Layout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-6 md:px-6 lg:px-8">
                <header className="mb-2">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="group flex items-center gap-2 pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                        <span className="text-base font-medium">Back</span>
                    </Button>
                </header>
                <main className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;