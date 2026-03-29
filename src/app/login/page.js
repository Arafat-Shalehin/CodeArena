import AuthLayout from '@/features/auth/components/AuthLayout'
import LoginForm from '@/features/auth/components/LoginForm'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
    return (
        <AuthLayout>
            <Suspense
                fallback={
                    <div className="flex h-full items-center justify-center">
                        <Loader2 className="text-accent h-8 w-8 animate-spin" />
                    </div>
                }
            >
                <LoginForm />
            </Suspense>
        </AuthLayout>
    )
}
