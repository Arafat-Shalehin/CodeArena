"use client"

import Link from "next/link"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false)

    return (
        <div className="w-full max-w-md mx-auto space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight">Welcome Back</h1>
                <p className="text-sm text-text-muted">
                    Sign in to continue your journey
                </p>
            </div>

            {/* Form */}
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                {/* Email field */}
                <div className="space-y-2">
                    <Label htmlFor="email">Email or Username</Label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-muted">
                            <Mail className="h-5 w-5" />
                        </div>
                        <Input
                            id="email"
                            placeholder="name@company.com"
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Password field */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link
                            href="#"
                            className="text-sm font-medium text-accent hover:text-accent-hover transition-colors"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-muted">
                            <Lock className="h-5 w-5" />
                        </div>
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-10 pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted hover:text-text-primary transition-colors focus:outline-none"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center space-x-2">
                    <Checkbox id="remember-me" />
                    <div className="grid gap-1.5 leading-none">
                        <Label
                            htmlFor="remember-me"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-text-secondary"
                        >
                            Remember me
                        </Label>
                    </div>
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full">
                    Sign In
                </Button>
            </form>

            {/* Divider */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-bg-page px-2 text-text-muted">Or continue with</span>
                </div>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-4">
                <Button variant="secondary" className="w-full">
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                    </svg>
                    Google
                </Button>
                <Button variant="secondary" className="w-full">
                    <svg className="mr-2 h-4 w-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.61-4.041-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
                    </svg>
                    GitHub
                </Button>
            </div>

            {/* Footer Link */}
            <p className="text-center text-sm text-text-secondary">
                Don&apos;t have an account?{" "}
                <Link
                    href="/signup"
                    className="font-medium text-accent hover:text-accent-hover hover:underline underline-offset-4 transition-colors"
                >
                    Sign Up
                </Link>
            </p>
        </div>
    )
}
