import {
    registerUser,
    loginUser,
    getAllUsers,
    getUserById,
    deleteUser,
} from '@/services/user.service'
import { createResponseWithCookie, createResponseClearCookie } from '@/lib/cookie'
import { signToken } from '@/lib/jwt'

/**
 * POST /api/auth/login
 * Authenticates user and sets JWT in httpOnly cookie.
 * The token is NEVER sent in the response body.
 */
export async function login(req) {
    const { email, password } = await req.json()

    const { token, user } = await loginUser(email, password)

    // Send user data in body, token ONLY in the cookie
    return createResponseWithCookie({ success: true, data: { user } }, token)
}

/**
 * POST /api/auth/register
 * Creates a new user and auto-logs-in via httpOnly cookie.
 */
export async function createUser(req) {
    const body = await req.json()
    const user = await registerUser(body)

    // Auto-login: sign a token and set the cookie
    const token = signToken({ id: user.id, role: user.role })

    return createResponseWithCookie({ success: true, data: { user } }, token, 201)
}

/**
 * POST /api/auth/logout
 * Clears the auth cookie.
 */
export async function logout() {
    return createResponseClearCookie({
        success: true,
        message: 'Logged out successfully.',
    })
}

/**
 * GET /api/users  (Admin only)
 */
export async function fetchUsers() {
    const users = await getAllUsers()
    return Response.json({ success: true, data: users })
}

/**
 * GET /api/users/[id]
 */
export async function fetchUserById(req, { params }) {
    const resolvedParams = await params
    const user = await getUserById(resolvedParams.id)
    return Response.json({ success: true, data: user })
}

/**
 * DELETE /api/users/[id]  (Admin only)
 */
export async function removeUser(req, { params }) {
    const resolvedParams = await params
    await deleteUser(resolvedParams.id)
    return Response.json({ success: true, message: 'User deleted.' })
}
