import { Terminal } from "lucide-react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import Image from "next/image"

const AuthLayout = ({ children }) => {
    return (
        <div className="flex min-h-screen flex-col font-sans">
            <Navbar />

            {/* Split Layout Container */}
            <div className="flex-grow flex items-stretch md:min-h-[calc(100vh-64px)]">

                {/* Single Centered Column */}
                <div className="w-full flex items-start justify-center p-4 sm:p-6 lg:p-8 pt-6 sm:pt-8 lg:pt-8 bg-bg-page relative">
                    {/* Header */}
                    <div className="w-full max-w-md space-y-6">
                        {children}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}

export default AuthLayout
