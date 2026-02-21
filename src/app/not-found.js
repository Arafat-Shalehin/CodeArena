import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-bg-page text-center">
            <h2 className="text-4xl font-display font-bold text-text-primary mb-4">404 - Page Not Found</h2>
            <p className="text-text-muted mb-8 max-w-md">
                The page you are looking for does not exist or has been moved.
            </p>
            <Link href="/">
                <Button>Return Home</Button>
            </Link>
        </div>
    );
}
