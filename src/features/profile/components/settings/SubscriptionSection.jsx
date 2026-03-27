'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, Crown, CreditCard, Check, X, Zap } from 'lucide-react'

const PLANS = [
    {
        id: 'free',
        name: 'Free',
        price: 0,
        features: [
            'Basic problem solving',
            'Limited submissions per day',
            'Community features',
            'Basic stats tracking',
        ],
        limitations: ['No advanced problems', 'No contest access', 'Limited practice mode'],
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 9.99,
        period: 'month',
        features: [
            'Unlimited submissions',
            'All problem difficulty levels',
            'Contest participation',
            'Advanced analytics',
            'Priority support',
            'Custom avatars',
            'No ads',
        ],
        popular: true,
    },
    {
        id: 'teams',
        name: 'Teams',
        price: 19.99,
        period: 'month',
        features: [
            'Everything in Pro',
            'Team workspaces',
            'Shared problem sets',
            'Team analytics',
            'Admin controls',
            'API access',
            'Dedicated support',
        ],
    },
]

export default function SubscriptionSection({ user }) {
    const [subscription, setSubscription] = useState({
        plan: 'free',
        status: 'active',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
    })
    const [isLoading, setIsLoading] = useState(true)
    const [isCanceling, setIsCanceling] = useState(false)

    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                const res = await fetch(`/api/users/${user._id}/subscription`)
                const data = await res.json()
                if (data.success && data.data) {
                    setSubscription(data.data)
                }
            } catch (error) {
                console.error('Failed to fetch subscription:', error)
            } finally {
                setIsLoading(false)
            }
        }

        if (user?._id) {
            fetchSubscription()
        }
    }, [user])

    const handleUpgrade = async (planId) => {
        if (planId === 'free') {
            toast.info('You are already on the free plan')
            return
        }

        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId, userId: user._id }),
            })

            const data = await res.json()

            if (data.url) {
                window.location.href = data.url
            } else {
                throw new Error(data.message || 'Failed to start checkout')
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleCancelSubscription = async () => {
        if (!confirm('Are you sure you want to cancel your subscription?')) {
            return
        }

        setIsCanceling(true)
        try {
            const res = await fetch(`/api/users/${user._id}/subscription`, {
                method: 'DELETE',
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Failed to cancel subscription')
            }

            toast.success('Subscription will be cancelled at the end of the billing period')
            setSubscription({ ...subscription, cancelAtPeriodEnd: true })
        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsCanceling(false)
        }
    }

    const currentPlan = PLANS.find((p) => p.id === subscription.plan) || PLANS[0]

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="text-accent h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Current Plan */}
            <Card className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Crown className="text-warning" size={24} />
                        <div>
                            <h3 className="text-text-primary text-lg font-semibold">
                                Current Plan
                            </h3>
                            <p className="text-text-muted text-sm">
                                {currentPlan.name === 'Free'
                                    ? 'Free Forever'
                                    : `$${currentPlan.price}/${currentPlan.period}`}
                            </p>
                        </div>
                    </div>
                    <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                            subscription.status === 'active'
                                ? 'bg-success/10 text-success'
                                : 'bg-warning/10 text-warning'
                        }`}
                    >
                        {subscription.status === 'active' ? 'Active' : 'Cancelled'}
                    </span>
                </div>

                {subscription.cancelAtPeriodEnd && (
                    <div className="bg-warning/10 border-warning/30 mb-4 rounded-lg border p-4">
                        <p className="text-warning text-sm">
                            Your subscription will end on{' '}
                            {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                        </p>
                    </div>
                )}

                {currentPlan.name !== 'Free' && !subscription.cancelAtPeriodEnd && (
                    <Button
                        variant="outline"
                        onClick={handleCancelSubscription}
                        disabled={isCanceling}
                        className="text-error border-error hover:bg-error/10"
                    >
                        {isCanceling ? 'Cancelling...' : 'Cancel Subscription'}
                    </Button>
                )}
            </Card>

            {/* Plan Options */}
            <div>
                <h3 className="text-text-primary mb-4 text-lg font-semibold">Available Plans</h3>
                <div className="grid gap-4 md:grid-cols-3">
                    {PLANS.map((plan) => (
                        <Card
                            key={plan.id}
                            className={`relative p-6 ${
                                plan.popular ? 'border-accent shadow-accent/10 shadow-lg' : ''
                            }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="bg-accent rounded-full px-3 py-1 text-xs font-medium text-white">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <div className="mb-6 text-center">
                                <h4 className="text-text-primary text-lg font-semibold">
                                    {plan.name}
                                </h4>
                                <div className="mt-2">
                                    <span className="text-text-primary text-3xl font-bold">
                                        ${plan.price}
                                    </span>
                                    {plan.price > 0 && (
                                        <span className="text-text-muted text-sm">
                                            /{plan.period}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <ul className="mb-6 space-y-3">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm">
                                        <Check className="text-success mt-0.5 shrink-0" size={16} />
                                        <span className="text-text-secondary">{feature}</span>
                                    </li>
                                ))}
                                {plan.limitations?.map((limitation, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm">
                                        <X className="text-text-muted mt-0.5 shrink-0" size={16} />
                                        <span className="text-text-muted">{limitation}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                onClick={() => handleUpgrade(plan.id)}
                                disabled={subscription.plan === plan.id}
                                className={`w-full ${
                                    plan.popular
                                        ? 'bg-accent hover:bg-accent-hover'
                                        : 'bg-bg-subtle hover:bg-bg-muted text-text-primary'
                                }`}
                            >
                                {subscription.plan === plan.id ? (
                                    'Current Plan'
                                ) : plan.price === 0 ? (
                                    'Downgrade'
                                ) : (
                                    <>
                                        <Zap className="mr-2 h-4 w-4" />
                                        Upgrade
                                    </>
                                )}
                            </Button>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Payment Method */}
            {currentPlan.name !== 'Free' && (
                <Card className="p-6">
                    <div className="mb-4 flex items-center gap-3">
                        <CreditCard className="text-accent" size={20} />
                        <h3 className="text-text-primary text-lg font-semibold">Payment Method</h3>
                    </div>
                    <p className="text-text-muted text-sm">
                        Manage your payment methods and billing history in the Stripe portal.
                    </p>
                    <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() =>
                            (window.location.href = `/api/stripe/portal?userId=${user._id}`)
                        }
                    >
                        Manage Billing
                    </Button>
                </Card>
            )}
        </div>
    )
}
