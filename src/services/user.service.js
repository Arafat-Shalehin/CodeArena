import { User } from '@/models/User.models'
import { signToken } from '@/lib/jwt'

/**
 * Registers a new user.
 * @param {Object} data - User registration data (name, email, password, role).
 * @returns {Promise<Object>} The created user object (excluding password).
 * @throws {Error} If email already exists or validation fails.
 */
export async function registerUser(data) {
    try {
        const safeData = {
            name: data.name,
            email: data.email,
            password: data.password,
            role: 'user',
        }

        const user = await User.create(safeData)

        return {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
        }
    } catch (error) {
        if (error.code === 11000) {
            const err = new Error('Email already exists.')
            err.status = 400
            throw err
        }
        throw error
    }
}

/**
 * Authenticates a user.
 * @param {string} email - User email.
 * @param {string} password - User password.
 * @returns {Promise<Object>} Object containing auth token and user details.
 * @throws {Error} If credentials are invalid.
 */
export async function loginUser(email, password) {
    const user = await User.findOne({ email }).select('+password')

    if (!user) {
        const err = new Error('User not found')
        err.status = 401
        throw err
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
        const remainingMinutes = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000))
        const err = new Error(
            `Account is temporarily locked. Please try again in ${remainingMinutes} minutes.`
        )
        err.status = 403
        throw err
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
        // Increment failed attempts
        user.loginAttempts += 1

        // Lock account if threshold reached
        if (user.loginAttempts >= 5) {
            user.lockUntil = Date.now() + 15 * 60 * 1000 // 15 minutes lock
        }

        await user.save()

        const err = new Error(
            user.loginAttempts >= 5
                ? 'Account locked due to multiple failed attempts. Please try again in 15 minutes.'
                : 'Invalid credentials.'
        )
        err.status = 401
        throw err
    }

    // Reset attempts on successful login
    if (user.loginAttempts > 0 || user.lockUntil > 0) {
        user.loginAttempts = 0
        user.lockUntil = 0
        await user.save()
    }

    const token = signToken({
        id: user._id,
        role: user.role,
    })

    return {
        token,
        user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
        },
    }
}

/**
 * Retrieves all users.
 * @returns {Promise<Array>} List of all users.
 */
export async function getAllUsers() {
    return User.find().select('-password')
}

/**
 * Retrieves a user by ID.
 * @param {string} id - User ID.
 * @returns {Promise<Object>} User object.
 * @throws {Error} If user is not found.
 */
export async function getUserById(id) {
    const user = await User.findById(id).select('-password')
    if (!user) {
        const err = new Error('User not found')
        err.status = 404
        throw err
    }
    return user
}

/**
 * Deletes a user by ID.
 * @param {string} id - User ID.
 * @returns {Promise<Object>} The deleted user object.
 * @throws {Error} If user is not found.
 */
export async function deleteUser(id) {
    const user = await User.findByIdAndDelete(id)
    if (!user) {
        const err = new Error('User not found')
        err.status = 404
        throw err
    }
    return user
}
