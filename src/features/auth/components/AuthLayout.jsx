import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const AuthLayout = ({ children }) => {
    return (
        <div className="flex min-h-screen flex-col font-sans">
            <Navbar />

            {/* Split Layout Container */}
            <div className="flex flex-grow items-stretch md:min-h-[calc(100vh-64px)]">
                {/* Single Centered Column */}
                <div className="bg-bg-page relative flex w-full items-start justify-center p-4 pt-6 sm:p-6 sm:pt-8 lg:p-8 lg:pt-8">
                    {/* Header */}
                    <div className="w-full max-w-md space-y-6">{children}</div>
                </div>
            </div>

            <Footer />
        </div>
    )
}

export default AuthLayout
