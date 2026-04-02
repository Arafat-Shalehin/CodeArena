/**
 * Run once to generate VAPID keys for Web Push.
 * Usage: node src/scripts/generate-vapid-keys.js
 * Then copy the output to your .env file.
 */
import webPush from 'web-push'

const keys = webPush.generateVAPIDKeys()

console.log('\n=== VAPID Keys for Web Push ===\n')
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`)
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`)
console.log(`VAPID_SUBJECT=mailto:admin@codearena.dev`)
console.log('\nAdd these to your .env file.\n')
