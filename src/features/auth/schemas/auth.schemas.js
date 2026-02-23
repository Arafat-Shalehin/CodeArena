import { z } from 'zod'

/**
 * @file Zod validation schemas for all authentication forms.
 * Used with react-hook-form via @hookform/resolvers/zod.
 */

/** Login form: email + password */
export const loginSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
})

/** Forgot password / magic link: email only */
export const emailOnlySchema = z.object({
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
})

/** Signup form: username + email + password + confirm + terms */
export const signupSchema = z
    .object({
        username: z
            .string()
            .min(3, 'Username must be at least 3 characters')
            .max(20, 'Username must be at most 20 characters')
            .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores'),
        email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
            .regex(/[0-9]/, 'Must contain at least one number')
            .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
        confirmPassword: z.string().min(1, 'Please confirm your password'),
        agreedToTerms: z.literal(true, {
            errorMap: () => ({ message: 'You must agree to the terms' }),
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    })
