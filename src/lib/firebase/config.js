import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

const isBuildPhase =
    process.env.NEXT_PHASE === 'phase-production-build' || process.env.SKIP_FIREBASE_INIT === 'true'

const hasRequiredFirebaseConfig =
    Boolean(firebaseConfig.apiKey) &&
    Boolean(firebaseConfig.authDomain) &&
    Boolean(firebaseConfig.projectId) &&
    Boolean(firebaseConfig.appId)

const canInitializeFirebase = !isBuildPhase && hasRequiredFirebaseConfig

// Avoid crashing SSR/build when Firebase public env vars are missing or placeholders.
const app = canInitializeFirebase
    ? !getApps().length
        ? initializeApp(firebaseConfig)
        : getApp()
    : null
export const auth = app ? getAuth(app) : null

/**
 * Helper to get Firebase auth and app instances.
 * This is used in some components that expect an async getter.
 */
export const getFirebaseAuth = async () => {
    return { auth, app }
}

export default app
