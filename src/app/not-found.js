import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col bg-bg-page">
            <Navbar />
            <main className="flex-grow flex flex-col items-center justify-center p-4 text-center">
                <h2 className="text-4xl font-display font-bold text-text-primary mb-4">404 - Page Not Found</h2>
                <p className="text-text-muted mb-8 max-w-md">
                    The page you are looking for does not exist or has been moved.
                </p>
                <Link href="/">
                    <Button>Return Home</Button>
                </Link>
            </main>
            <Footer />
        </div>
    );
}
