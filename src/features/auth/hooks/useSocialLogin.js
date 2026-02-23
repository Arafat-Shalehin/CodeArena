'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase/config'
import { signInWithPopup, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth'

/**
 * @hook useSocialLogin
 * @description Shared hook for Google/GitHub OAuth sign-in via Firebase.
 * Used by both LoginForm and SignupForm to avoid duplicating social login logic.
 *
 * @returns {{ handleSocialLogin: (providerName: 'google' | 'github') => Promise<void>, isLoading: boolean, error: string }}
 */
export function useSocialLogin() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSocialLogin = async (providerName) => {
        setError('')
        setIsLoading(true)

        try {
            const provider =
                providerName === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider()

            await signInWithPopup(auth, provider)
            router.push('/profile')
        } catch (err) {
            if (err.code === 'auth/account-exists-with-different-credential') {
                setError(
                    'An account already exists with the same email address but different sign-in credentials.'
                )
            } else {
                setError(err.message.replace('Firebase: ', ''))
            }
        } finally {
            setIsLoading(false)
        }
    }

    return { handleSocialLogin, isLoading, error }
}
