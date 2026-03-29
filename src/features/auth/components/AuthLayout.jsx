import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const AuthLayout = ({ children }) => {
    return (
        <div className="bg-bg-page flex min-h-screen flex-col font-sans">
            <Navbar />

            {/* Split Layout Container */}
            <div className="flex flex-grow items-stretch">
                {/* Left Panel: Visual/Technical (Hidden on mobile) */}
                <div className="bg-bg-surface border-border relative hidden flex-1 flex-col items-center justify-center overflow-hidden border-r lg:flex">
                    <div className="pointer-events-none absolute inset-0 opacity-10">
                        <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:20px_20px]"></div>
                    </div>

                    <div className="relative z-10 w-full max-w-lg space-y-4 px-12">
                        <div className="bg-accent/10 border-accent/20 text-accent inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs">
                            <span className="relative flex h-2 w-2">
                                <span className="bg-accent absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
                                <span className="bg-accent relative inline-flex h-2 w-2 rounded-full"></span>
                            </span>
                            v2.1.0_stable
                        </div>
                        <h2 className="text-text-primary text-4xl font-bold tracking-tight">
                            The Ultimate Arena for <span className="text-accent">Developers.</span>
                        </h2>
                        <p className="text-text-muted text-lg leading-relaxed">
                            Join thousands of developers solving complex problems, competing in
                            contests, and advancing their careers.
                        </p>

                        <div className="grid grid-cols-2 gap-6 pt-8">
                            <div className="border-border bg-bg-page/50 rounded-xl border p-4 backdrop-blur-sm">
                                <div className="text-accent mb-1 text-xl font-bold">500+</div>
                                <div className="text-text-muted text-sm">Curated Problems</div>
                            </div>
                            <div className="border-border bg-bg-page/50 rounded-xl border p-4 backdrop-blur-sm">
                                <div className="text-accent mb-1 text-xl font-bold">Weekly</div>
                                <div className="text-text-muted text-sm">Contests</div>
                            </div>
                        </div>
                    </div>

                    {/* Subtle Code Decorator */}
                    <div className="text-text-muted/30 absolute right-8 bottom-8 left-8 font-mono text-[10px] select-none">
                        {`// Initialize Core Engine\nconst arena = new CodeArena({ mode: 'competitive' });\narena.start();`}
                    </div>
                </div>

                {/* Right Panel: Functional Forms */}
                <div className="relative flex w-full flex-1 items-center justify-center p-6 lg:p-12">
                    <div className="w-full max-w-md">{children}</div>
                </div>
            </div>

            <Footer />
        </div>
    )
}

export default AuthLayout
