import {
    registerUser,
    loginUser,
    getAllUsers,
    getUserById,
    deleteUser,
    updateUser,
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

/**
 * PUT /api/users/[id]
 */
export async function updateUserDetails(req, { params }) {
    const resolvedParams = await params
    const body = await req.json()

    console.log('updateUserDetails called:', {
        params: resolvedParams,
        body,
        userId: req.user?.id,
        userRole: req.user?.role,
    })

    // Ensure the req.user exists and matches the ID (or is admin)
    // Assuming req.user is populated by protect middleware
    const userId = req.user?.id || req.user?._id
    if (userId && userId.toString() !== resolvedParams.id && req.user.role !== 'admin') {
        return Response.json(
            { success: false, message: 'Not authorized to update this profile' },
            { status: 403 }
        )
    }

    const updatedUser = await updateUser(resolvedParams.id, body)
    return Response.json({ success: true, data: updatedUser })
}

/**
 * POST /api/users/[id]/follow
 */
export async function handleToggleFollow(req, { params }) {
    const resolvedParams = await params

    // req.user is populated by protect middleware
    const currentUserId = req.user?.id || req.user?._id
    if (!currentUserId) {
        return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { toggleFollowUser } = await import('@/services/user.service')
    const result = await toggleFollowUser(currentUserId.toString(), resolvedParams.id)

    return Response.json({ success: true, data: result })
}
