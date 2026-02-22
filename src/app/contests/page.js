import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function ContestsPage() {
    return (
        <div className="min-h-screen flex flex-col bg-bg-page">
            <Navbar />
            <main className="flex-grow max-w-7xl mx-auto px-4 md:px-6 py-16 w-full">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-text-primary">Contests</h1>
                    <p className="text-text-muted text-lg">Compete in live coding contests and climb the ranks.</p>
                    <div className="mt-8 p-12 border border-dashed border-border rounded-xl bg-bg-subtle">
                        <p className="text-text-muted">Coming Soon — This page is under construction.</p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
