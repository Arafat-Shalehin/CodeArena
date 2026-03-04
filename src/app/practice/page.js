import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function PracticePage() {
    return (
        <div className="bg-bg-page site-gradient flex min-h-screen flex-col">
            <Navbar />
            <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-16 md:px-6">
                <div className="space-y-4 text-center">
                    <h1 className="text-text-primary text-4xl font-bold">Practice</h1>
                    <p className="text-text-muted text-lg">
                        Sharpen your skills with targeted practice sessions.
                    </p>
                    <div className="border-border bg-bg-subtle mt-8 rounded-xl border border-dashed p-12">
                        <p className="text-text-muted">
                            Coming Soon — This page is under construction.
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
