import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function NotFound() {
    return (
        <div className="bg-bg-page flex min-h-screen flex-col">
            <Navbar />
            <main className="flex flex-grow flex-col items-center justify-center p-4 text-center">
                <h2 className="font-display text-text-primary mb-4 text-4xl font-bold">
                    404 - Page Not Found
                </h2>
                <p className="text-text-muted mb-8 max-w-md">
                    The page you are looking for does not exist or has been moved.
                </p>
                <Link href="/">
                    <Button>Return Home</Button>
                </Link>
            </main>
            <Footer />
        </div>
    )
}
