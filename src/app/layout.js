import { Inter, Bricolage_Grotesque, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
})

const bricolage = Bricolage_Grotesque({
    subsets: ['latin'],
    variable: '--font-bricolage',
    display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-jetbrains',
    display: 'swap',
})

export const metadata = {
    title: 'CodeArena | Competitive Programming & Coding Challenges',
    description:
        'Join CodeArena to master algorithms, prepare for technical interviews, and compete in live coding contests. Solve 2,500+ coding challenges in 20+ languages.',
}

export default function RootLayout({ children }) {
    return (
        <html
            lang="en"
            className={`${inter.variable} ${bricolage.variable} ${jetbrainsMono.variable}`}
        >
            <body className="bg-bg-page site-gradient text-text-primary font-sans antialiased">
                {/* Skip-to-content link — visible only on keyboard focus */}
                <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-black focus:shadow-lg focus:outline-none"
                >
                    Skip to content
                </a>
                <AuthProvider>{children}</AuthProvider>
                <Toaster position="top-center" />
            </body>
        </html>
    )
}
