'use client'

// Next.js
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

// React
import { useState, useEffect, useRef } from 'react'

// Form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, emailOnlySchema } from '@/features/auth/schemas/auth.schemas'

// UI
import { Eye, EyeOff, Lock, Mail, Loader2, ArrowLeft, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

// Firebase
import { auth } from '@/lib/firebase/config'
import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink,
} from 'firebase/auth'

// Hooks
import { useSocialLogin } from '@/features/auth/hooks/useSocialLogin'

/**
 * @component LoginForm
 * @description Multi-view login form supporting email/password, forgot password,
 * magic link, and social OAuth. Uses react-hook-form with Zod validation.
 */
export default function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirectTo = searchParams.get('redirect') || '/feed'
    const { handleSocialLogin, isLoading: socialLoading, error: socialError } = useSocialLogin()
    const urlError = searchParams.get('error')
    const hasShownUrlError = useRef(false)

    // Handle URL-based errors (e.g., redirect from protected route)
    useEffect(() => {
        if (urlError === 'unauthorized' && !hasShownUrlError.current) {
            toast.error('Session expired or unauthorized. Please log in again.')
            hasShownUrlError.current = true
        }
    }, [urlError])

    // UI state
    const [view, setView] = useState('email') // "email" | "forgot-password" | "magic-link"
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    // Login form (email + password)
    const loginForm = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    })

    // Email-only form (forgot password / magic link)
    const emailForm = useForm({
        resolver: zodResolver(emailOnlySchema),
        defaultValues: { email: '' },
    })

    // Magic link return handler
    useEffect(() => {
        if (typeof window !== 'undefined' && isSignInWithEmailLink(auth, window.location.href)) {
            let emailForSignIn = window.localStorage.getItem('emailForSignIn')
            if (!emailForSignIn) {
                emailForSignIn = window.prompt('Please provide your email for confirmation')
            }
            if (emailForSignIn) {
                setIsLoading(true)
                signInWithEmailLink(auth, emailForSignIn, window.location.href)
                    .then(() => {
                        window.localStorage.removeItem('emailForSignIn')
                        toast.success('Successfully signed in with magic link!')
                        router.replace('/feed')
                    })
                    .catch((err) => {
                        toast.error(err.message.replace('Firebase: ', ''))
                        setIsLoading(false)
                    })
            }
        }
    }, [router])

    const onLoginSubmit = async (data) => {
        setIsLoading(true)
        try {
            await signInWithEmailAndPassword(auth, data.email, data.password)
            toast.success('Authentication successful')
            router.replace(redirectTo)
        } catch (err) {
            toast.error(err.message.replace('Firebase: ', ''))
        } finally {
            setIsLoading(false)
        }
    }

    const onForgotPasswordSubmit = async (data) => {
        setIsLoading(true)
        try {
            await sendPasswordResetEmail(auth, data.email)
            toast.success('Password reset email sent! Check your inbox.')
            switchView('email')
        } catch (err) {
            toast.error(err.message.replace('Firebase: ', ''))
        } finally {
            setIsLoading(false)
        }
    }

    const onMagicLinkSubmit = async (data) => {
        setIsLoading(true)
        try {
            await sendSignInLinkToEmail(auth, data.email, {
                url: window.location.origin + '/login',
                handleCodeInApp: true,
            })
            window.localStorage.setItem('emailForSignIn', data.email)
            toast.success('Magic link sent! Check your inbox to sign in.')
            switchView('email')
        } catch (err) {
            toast.error(err.message.replace('Firebase: ', ''))
        } finally {
            setIsLoading(false)
        }
    }

    /** Switch to a sub-view, clearing errors */
    const switchView = (newView) => {
        setView(newView)
        emailForm.reset()
    }

    const renderHeader = () => {
        switch (view) {
            case 'forgot-password':
                return (
                    <div className="space-y-4">
                        <div className="bg-accent/10 text-accent mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl">
                            <Lock className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-text-primary text-2xl font-bold tracking-tight">
                                Reset Password
                            </h1>
                            <p className="text-text-muted text-sm">
                                We&apos;ll email you instructions to reset your password.
                            </p>
                        </div>
                    </div>
                )
            case 'magic-link':
                return (
                    <div className="space-y-4">
                        <div className="bg-accent/10 text-accent mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl">
                            <Mail className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-text-primary text-2xl font-bold tracking-tight">
                                Email Magic Link
                            </h1>
                            <p className="text-text-muted text-sm">
                                We&apos;ll email you a secure link to sign in instantly.
                            </p>
                        </div>
                    </div>
                )
            default:
                return (
                    <div className="space-y-1">
                        <h1 className="text-text-primary text-3xl font-bold tracking-tight">
                            Welcome <span className="text-accent">Back</span>
                        </h1>
                        <p className="text-text-muted text-sm">
                            Enter your credentials to access your dashboard
                        </p>
                    </div>
                )
        }
    }

    const anyLoading = isLoading || socialLoading

    return (
        <div className="mx-auto w-full max-w-md space-y-6">
            {view !== 'email' && (
                <button
                    type="button"
                    onClick={() => switchView('email')}
                    className="text-text-muted hover:text-accent flex items-center text-sm transition-colors"
                >
                    <ArrowLeft className="mr-1 h-4 w-4" /> Back to sign in
                </button>
            )}

            {renderHeader()}

            {/* Social errors */}
            {socialError && (
                <div className="bg-error-light border-error/20 text-error rounded-lg border p-3 text-sm font-medium">
                    {socialError}
                </div>
            )}

            {/* ── Email / Password Form ── */}
            {view === 'email' && (
                <form className="space-y-6" onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                    <div className="space-y-2">
                        <Label
                            htmlFor="email"
                            className="text-text-muted font-mono text-xs tracking-wider uppercase"
                        >
                            User Email
                        </Label>
                        <div className="group relative">
                            <div className="text-text-muted group-focus-within:text-accent pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 transition-colors">
                                <Mail className="h-5 w-5" />
                            </div>
                            <Input
                                id="email"
                                type="email"
                                placeholder="developer@codearena.com"
                                className="bg-bg-surface/50 border-border group-focus-within:border-accent/50 h-11 pl-10 font-mono text-sm transition-all"
                                disabled={anyLoading}
                                {...loginForm.register('email')}
                            />
                        </div>
                        {loginForm.formState.errors.email && (
                            <p className="text-error flex items-center gap-1 text-xs font-medium">
                                <AlertCircle className="h-3 w-3" />{' '}
                                {loginForm.formState.errors.email.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label
                                htmlFor="password"
                                className="text-text-muted font-mono text-xs tracking-wider uppercase"
                            >
                                Access Key
                            </Label>
                            <button
                                type="button"
                                onClick={() => switchView('forgot-password')}
                                className="text-accent hover:text-accent-hover text-xs font-medium transition-colors"
                            >
                                Forgot?
                            </button>
                        </div>
                        <div className="group relative">
                            <div className="text-text-muted group-focus-within:text-accent pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 transition-colors">
                                <Lock className="h-5 w-5" />
                            </div>
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                className="bg-bg-surface/50 border-border group-focus-within:border-accent/50 h-11 pr-10 pl-10 font-mono text-sm transition-all"
                                disabled={anyLoading}
                                {...loginForm.register('password')}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-text-muted hover:text-text-primary absolute inset-y-0 right-0 flex items-center pr-3 transition-colors focus:outline-none"
                                disabled={anyLoading}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                        {loginForm.formState.errors.password && (
                            <p className="text-error flex items-center gap-1 text-xs font-medium">
                                <AlertCircle className="h-3 w-3" />{' '}
                                {loginForm.formState.errors.password.message}
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="shadow-accent/20 h-11 w-full shadow-lg"
                        disabled={anyLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            'Authenticate'
                        )}
                    </Button>
                </form>
            )}

            {/* ── Forgot Password Flow ── */}
            {view === 'forgot-password' && (
                <form
                    className="space-y-4"
                    onSubmit={emailForm.handleSubmit(onForgotPasswordSubmit)}
                >
                    <div className="space-y-2">
                        <Label htmlFor="reset-email">Email Address</Label>
                        <div className="relative">
                            <div className="text-text-muted pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Mail className="h-5 w-5" />
                            </div>
                            <Input
                                id="reset-email"
                                type="email"
                                placeholder="name@company.com"
                                className="pl-10"
                                disabled={isLoading}
                                {...emailForm.register('email')}
                            />
                        </div>
                        {emailForm.formState.errors.email && (
                            <p className="text-error text-xs font-medium">
                                {emailForm.formState.errors.email.message}
                            </p>
                        )}
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            'Send Reset Link'
                        )}
                    </Button>
                </form>
            )}

            {/* ── Magic Link Flow ── */}
            {view === 'magic-link' && (
                <form className="space-y-4" onSubmit={emailForm.handleSubmit(onMagicLinkSubmit)}>
                    <div className="space-y-2">
                        <Label htmlFor="magic-email">Email Address</Label>
                        <div className="relative">
                            <div className="text-text-muted pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Mail className="h-5 w-5" />
                            </div>
                            <Input
                                id="magic-email"
                                type="email"
                                placeholder="name@company.com"
                                className="pl-10"
                                disabled={isLoading}
                                {...emailForm.register('email')}
                            />
                        </div>
                        {emailForm.formState.errors.email && (
                            <p className="text-error text-xs font-medium">
                                {emailForm.formState.errors.email.message}
                            </p>
                        )}
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            'Send Magic Link'
                        )}
                    </Button>
                </form>
            )}

            {/* ── Social Login Section ── */}
            {view === 'email' && (
                <>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <Separator />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-bg-page text-text-muted px-2">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant="secondary"
                            className="text-text-primary hover:text-accent w-full transition-colors"
                            onClick={() => handleSocialLogin('google')}
                            disabled={anyLoading}
                            type="button"
                        >
                            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                ></path>
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                ></path>
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                    fill="#FBBC05"
                                ></path>
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                ></path>
                            </svg>
                            Google
                        </Button>
                        <Button
                            variant="secondary"
                            className="text-text-primary hover:text-accent w-full transition-colors"
                            onClick={() => handleSocialLogin('github')}
                            disabled={anyLoading}
                            type="button"
                        >
                            <svg className="mr-2 h-4 w-4 fill-current" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.61-4.041-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
                            </svg>
                            GitHub
                        </Button>
                        <Button
                            variant="outline"
                            className="bg-bg-surface border-border hover:bg-bg-subtle hover:text-accent col-span-2 w-full"
                            onClick={() => switchView('magic-link')}
                            disabled={anyLoading}
                        >
                            <Mail className="mr-2 h-4 w-4" />
                            Sign in with Email
                        </Button>
                    </div>
                </>
            )}

            {/* Footer Link */}
            {view === 'email' && (
                <p className="text-text-secondary text-center text-sm">
                    Don&apos;t have an account?{' '}
                    <Link
                        href="/signup"
                        className="text-accent hover:text-accent-hover font-medium underline-offset-4 transition-colors hover:underline"
                    >
                        Sign Up
                    </Link>
                </p>
            )}
        </div>
    )
}
