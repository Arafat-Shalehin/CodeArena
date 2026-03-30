/**
 * Format time in milliseconds to readable string
 * @param {number} ms - Time in milliseconds
 * @returns {string} - Formatted time string
 */
export function formatTime(ms) {
    if (ms < 1000) {
        return `${ms}ms`
    }
    return `${(ms / 1000).toFixed(2)}s`
}

/**
 * Format memory in KB to readable string
 * @param {number} kb - Memory in KB
 * @returns {string} - Formatted memory string
 */
export function formatMemory(kb) {
    if (kb < 1024) {
        return `${kb}KB`
    }
    return `${(kb / 1024).toFixed(2)}MB`
}

/**
 * Format file size in bytes to readable string
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted size string
 */
export function formatFileSize(bytes) {
    if (bytes < 1024) {
        return `${bytes}B`
    }
    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(2)}KB`
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)}MB`
}

/**
 * Truncate string to specified length
 * @param {string} str - Input string
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated string with ellipsis
 */
export function truncate(str, maxLength = 100) {
    if (str.length <= maxLength) {
        return str
    }
    return str.substring(0, maxLength) + '...'
}

/**
 * Get verdict color class
 * @param {string} verdict - Verdict code
 * @returns {string} - Tailwind color class
 */
export function getVerdictColor(verdict) {
    const colors = {
        AC: 'text-green-600 bg-green-100',
        ACCEPTED: 'text-green-600 bg-green-100',
        EX: 'text-cyan-600 bg-cyan-100',
        EXECUTED: 'text-cyan-600 bg-cyan-100',
        WA: 'text-red-600 bg-red-100',
        WRONG_ANSWER: 'text-red-600 bg-red-100',
        TLE: 'text-orange-600 bg-orange-100',
        TIME_LIMIT_EXCEEDED: 'text-orange-600 bg-orange-100',
        MLE: 'text-orange-600 bg-orange-100',
        MEMORY_LIMIT_EXCEEDED: 'text-orange-600 bg-orange-100',
        RE: 'text-red-600 bg-red-100',
        RUNTIME_ERROR: 'text-red-600 bg-red-100',
        CE: 'text-red-600 bg-red-100',
        COMPILATION_ERROR: 'text-red-600 bg-red-100',
        SE: 'text-purple-600 bg-purple-100',
        SYSTEM_ERROR: 'text-purple-600 bg-purple-100',
        PD: 'text-gray-600 bg-gray-100',
        PENDING: 'text-gray-600 bg-gray-100',
        JD: 'text-blue-600 bg-blue-100',
        JUDGING: 'text-blue-600 bg-blue-100',
    }
    return colors[verdict] || 'text-gray-600 bg-gray-100'
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait = 300) {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} - Promise that resolves after sleep
 */
export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Calculate percentage
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @returns {number} - Percentage
 */
export function percentage(value, total) {
    if (total === 0) return 0
    return Math.round((value / total) * 100)
}

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean} - True if valid
 */
export function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
}

/**
 * Generate random ID
 * @param {number} length - Length of ID
 * @returns {string} - Random ID
 */
export function generateId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - True if successful
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch (error) {
        console.error('Failed to copy:', error)
        return false
    }
}

/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted date string
 */
export function formatDate(date) {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

/**
 * Get relative time (e.g., "2 hours ago")
 * @param {Date|string} date - Date to compare
 * @returns {string} - Relative time string
 */
export function getRelativeTime(date) {
    const d = new Date(date)
    const now = new Date()
    const diff = now - d

    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (seconds < 60) return 'just now'
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`

    return formatDate(date)
}
