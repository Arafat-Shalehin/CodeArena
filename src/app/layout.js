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
            <head>
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
                />
            </head>
            <body className="bg-bg-page text-text-primary font-sans antialiased">
                <AuthProvider>{children}</AuthProvider>
                <Toaster position="top-center" />
            </body>
        </html>
    )
}
