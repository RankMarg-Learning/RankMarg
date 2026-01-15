import Footer from '@/components/Footer';

export default function SupportPageLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {children}
            <Footer />
        </>
    );
}