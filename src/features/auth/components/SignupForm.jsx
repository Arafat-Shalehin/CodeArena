'use client'

// Next.js
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// React
import { useState } from 'react'

// Form
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signupSchema } from '@/features/auth/schemas/auth.schemas'

// UI
import {
    Eye,
    EyeOff,
    Lock,
    Mail,
    CheckCircle,
    LockKeyhole,
    AlertCircle,
    Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

// Firebase
import { auth } from '@/lib/firebase/config'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'

// Hooks
import { useSocialLogin } from '@/features/auth/hooks/useSocialLogin'

/**
 * @component SignupForm
 * @description Registration form with username, email, password (with strength meter),
 * confirm password, terms checkbox, and social OAuth. Uses react-hook-form with Zod validation.
 */
export default function SignupForm() {
    const router = useRouter()
    const { handleSocialLogin, isLoading: socialLoading, error: socialError } = useSocialLogin()

    // UI state
    const [showPassword, setShowPassword] = useState(false)
    const [apiError, setApiError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    // Form
    const {
        register,
        handleSubmit,
        watch,
        control,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            agreedToTerms: false,
        },
    })

    // Watch password for strength meter
    const password = watch('password', '')

    // Password strength calculation
    const getStrength = () => {
        let score = 0
        if (password.length >= 8) score++
        if (/[A-Z]/.test(password)) score++
        if (/[0-9]/.test(password)) score++
        if (/[^A-Za-z0-9]/.test(password)) score++
        return score
    }

    const strength = getStrength()

    const getStrengthColor = (index) => {
        if (strength === 0) return 'bg-border'
        if (index < strength) {
            if (strength <= 2) return 'bg-error'
            if (strength === 3) return 'bg-warning'
            return 'bg-success'
        }
        return 'bg-border'
    }

    const getStrengthText = () => {
        if (strength === 0) return ''
        if (strength <= 2) return 'Weak'
        if (strength === 3) return 'Medium'
        return 'Strong'
    }

    const getStrengthTextColor = () => {
        if (strength <= 2) return 'text-error'
        if (strength === 3) return 'text-warning'
        return 'text-success'
    }

    const onSubmit = async (data) => {
        setApiError('')
        setIsLoading(true)

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                data.email,
                data.password
            )
            await updateProfile(userCredential.user, { displayName: data.username })
            router.push('/profile')
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setApiError('An account with this email already exists.')
            } else if (err.code === 'auth/weak-password') {
                setApiError('Password is too weak.')
            } else {
                setApiError(err.message)
            }
        } finally {
            setIsLoading(false)
        }
    }

    const anyLoading = isLoading || socialLoading

    return (
        <div className="mx-auto w-full max-w-md space-y-4">
            <div className="space-y-1 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">Create Account</h1>
                <p className="text-text-muted text-sm">
                    Start your coding journey with CodeArena today.
                </p>
            </div>

            {/* Error Message */}
            {(apiError || socialError) && (
                <div className="bg-error-light border-error/20 text-error rounded-lg border p-3 text-sm font-medium">
                    {apiError || socialError}
                </div>
            )}

            {/* Form */}
            <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
                {/* Username */}
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                        <Label htmlFor="username">Username</Label>
                        <div className="group relative">
                            <AlertCircle className="text-text-muted hover:text-accent h-3.5 w-3.5 cursor-help" />
                            <div className="bg-text-primary text-bg-page pointer-events-none invisible absolute bottom-full left-1/2 z-50 mb-2 w-48 -translate-x-1/2 rounded-md p-2 text-center text-xs opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:opacity-100">
                                Only letters, numbers, and underscores
                                <div className="border-t-text-primary absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent"></div>
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="text-text-muted pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="text-sm font-bold">@</span>
                        </div>
                        <Input
                            id="username"
                            placeholder="username"
                            className="h-9 pl-9"
                            disabled={anyLoading}
                            {...register('username')}
                        />
                    </div>
                    {errors.username && (
                        <p className="text-error text-xs font-medium">{errors.username.message}</p>
                    )}
                </div>

                {/* Email */}
                <div className="space-y-1">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                        <div className="text-text-muted pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Mail className="h-4 w-4" />
                        </div>
                        <Input
                            id="email"
                            type="email"
                            placeholder="your.email@example.com"
                            className="h-9 pl-9"
                            disabled={anyLoading}
                            {...register('email')}
                        />
                    </div>
                    {errors.email && (
                        <p className="text-error text-xs font-medium">{errors.email.message}</p>
                    )}
                </div>

                {/* Password */}
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                        <Label htmlFor="password">Password</Label>
                        <div className="group relative">
                            <div
                                className={cn(
                                    'cursor-help transition-colors',
                                    strength === 4
                                        ? 'text-success'
                                        : 'text-text-muted hover:text-warning'
                                )}
                            >
                                <AlertCircle className="h-3.5 w-3.5" />
                            </div>
                            <div className="bg-bg-page border-border pointer-events-none invisible absolute bottom-full left-0 z-50 mb-2 w-56 rounded-lg border p-3 opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:opacity-100">
                                <p className="text-text-primary mb-2 text-xs font-semibold">
                                    Password Requirements
                                </p>
                                <div className="space-y-1.5">
                                    <div
                                        className={cn(
                                            'flex items-center gap-2 text-xs',
                                            password.length >= 8
                                                ? 'text-success'
                                                : 'text-text-muted'
                                        )}
                                    >
                                        <CheckCircle className="h-3 w-3 shrink-0" /> 8+ characters
                                    </div>
                                    <div
                                        className={cn(
                                            'flex items-center gap-2 text-xs',
                                            /[A-Z]/.test(password)
                                                ? 'text-success'
                                                : 'text-text-muted'
                                        )}
                                    >
                                        <CheckCircle className="h-3 w-3 shrink-0" /> One uppercase
                                    </div>
                                    <div
                                        className={cn(
                                            'flex items-center gap-2 text-xs',
                                            /[0-9]/.test(password)
                                                ? 'text-success'
                                                : 'text-text-muted'
                                        )}
                                    >
                                        <CheckCircle className="h-3 w-3 shrink-0" /> One number
                                    </div>
                                    <div
                                        className={cn(
                                            'flex items-center gap-2 text-xs',
                                            /[^A-Za-z0-9]/.test(password)
                                                ? 'text-success'
                                                : 'text-text-muted'
                                        )}
                                    >
                                        <CheckCircle className="h-3 w-3 shrink-0" /> Special char
                                    </div>
                                </div>
                                <div className="border-t-bg-page absolute top-full left-1 border-4 border-transparent drop-shadow-sm"></div>
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="text-text-muted pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Lock className="h-4 w-4" />
                        </div>
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Create a strong password"
                            className="h-9 pr-9 pl-9"
                            disabled={anyLoading}
                            {...register('password')}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-text-muted hover:text-text-primary absolute inset-y-0 right-0 flex items-center pr-3 transition-colors focus:outline-none"
                            disabled={anyLoading}
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-error text-xs font-medium">{errors.password.message}</p>
                    )}

                    {/* Password Strength Meter */}
                    {password && (
                        <div className="pt-1">
                            <div className="mb-0.5 flex items-center justify-between">
                                <span className="text-text-muted text-[10px] font-medium">
                                    Strength:{' '}
                                    <span className={cn('font-bold', getStrengthTextColor())}>
                                        {getStrengthText()}
                                    </span>
                                </span>
                            </div>
                            <div className="flex h-1 w-full gap-1">
                                {[0, 1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            'h-full flex-1 rounded-full',
                                            getStrengthColor(i)
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative">
                        <div className="text-text-muted pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <LockKeyhole className="h-4 w-4" />
                        </div>
                        <Input
                            id="confirm-password"
                            type="password"
                            placeholder="Confirm your password"
                            className="h-9 pl-9"
                            disabled={anyLoading}
                            {...register('confirmPassword')}
                        />
                    </div>
                    {errors.confirmPassword && (
                        <p className="text-error text-xs font-medium">
                            {errors.confirmPassword.message}
                        </p>
                    )}
                </div>

                {/* Terms Checkbox */}
                <div className="space-y-1">
                    <div className="flex items-start space-x-2 py-1">
                        <Controller
                            name="agreedToTerms"
                            control={control}
                            render={({ field }) => (
                                <Checkbox
                                    id="terms"
                                    className="mt-0.5"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={anyLoading}
                                />
                            )}
                        />
                        <div className="grid gap-1 leading-none">
                            <Label
                                htmlFor="terms"
                                className="text-text-secondary cursor-pointer text-[11px] leading-tight font-normal"
                            >
                                I agree to the{' '}
                                <Link
                                    href="#"
                                    className="text-accent font-semibold underline-offset-2 hover:underline"
                                >
                                    Terms of Service
                                </Link>{' '}
                                and{' '}
                                <Link
                                    href="#"
                                    className="text-accent font-semibold underline-offset-2 hover:underline"
                                >
                                    Privacy Policy
                                </Link>
                                .
                            </Label>
                        </div>
                    </div>
                    {errors.agreedToTerms && (
                        <p className="text-error text-xs font-medium">
                            {errors.agreedToTerms.message}
                        </p>
                    )}
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    className="shadow-accent/25 h-9 w-full shadow-lg"
                    disabled={anyLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...
                        </>
                    ) : (
                        'Create Account'
                    )}
                </Button>
            </form>

            {/* Divider */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <Separator />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-bg-page text-text-muted px-2">Or</span>
                </div>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-4">
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
            </div>

            {/* Footer Link */}
            <p className="text-text-secondary text-center text-sm">
                Already have an account?{' '}
                <Link
                    href="/login"
                    className="text-accent hover:text-accent-hover font-bold underline-offset-4 transition-colors hover:underline"
                >
                    Sign In
                </Link>
            </p>
        </div>
    )
}
