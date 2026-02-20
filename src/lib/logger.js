import { createLog } from "@/services/log.service";

/**
 * Internal safe logger wrapper
 * Ensures logging failure never breaks application flow
 */
async function safeLog(payload) {
    try {
        await createLog(payload);
    } catch (err) {
        // Fallback: Never crash the app due to logging failure
        if (process.env.NODE_ENV !== "production") {
            console.error("Logger failure:", err.message);
        }
    }
}

/**
 * Factory to create log type helpers
 */
function createTypeLogger(type) {
    return {
        info: async (message, meta = {}) =>
            safeLog({ type, level: "info", message, ...meta }),

        warn: async (message, meta = {}) =>
            safeLog({ type, level: "warn", message, ...meta }),

        error: async (message, meta = {}) =>
            safeLog({ type, level: "error", message, ...meta }),
    };
}

/**
 * Centralized logger object
 */
export const logger = {
    system: createTypeLogger("SYSTEM"),
    auth: createTypeLogger("AUTH"),
    contest: createTypeLogger("CONTEST"),
    submission: createTypeLogger("SUBMISSION"),
    execution: createTypeLogger("EXECUTION"),
    security: createTypeLogger("SECURITY"),
    database: createTypeLogger("DATABASE"),
};