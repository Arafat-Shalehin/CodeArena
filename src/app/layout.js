import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { CodeEditorProvider } from '@/context/CodeEditorContext'
import { Toaster } from '@/components/ui/sonner'
import { HydrationWrapper } from '@/components/providers/HydrationWrapper'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { SmoothScroll } from '@/components/providers/SmoothScroll'

const jakarta = Plus_Jakarta_Sans({
    subsets: ['latin'],
    variable: '--font-jakarta',
    display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-jetbrains',
    display: 'swap',
})

// Early theme class injection to prevent FOUC
if (typeof window !== 'undefined') {
    const theme = localStorage.getItem('theme')
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark')
    } else {
        document.documentElement.classList.remove('dark')
    }
}

export const metadata = {
    title: 'CodeArena | Competitive Programming & Coding Challenges',
    description:
        'Join CodeArena to master algorithms, prepare for technical interviews, and compete in live coding contests. Solve 2,500+ coding challenges in 20+ languages.',
}

export default function RootLayout({ children }) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={`${jakarta.variable} ${jetbrainsMono.variable}`}
        >
            <body
                suppressHydrationWarning={true}
                className="bg-bg-page site-gradient text-text-primary font-sans antialiased transition-colors duration-300"
            >
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    <SmoothScroll>
                        <HydrationWrapper>
                            <AuthProvider>
                                <CodeEditorProvider>{children}</CodeEditorProvider>
                            </AuthProvider>
                        </HydrationWrapper>
                        <Toaster position="top-center" />
                    </SmoothScroll>
                </ThemeProvider>
            </body>
        </html>
    )
}
