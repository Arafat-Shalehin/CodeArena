const mongoose = require('mongoose')
const Docker = require('dockerode')
require('dotenv').config({ path: './.env.local' })

async function testConnections() {
    console.log('--- STARTING DIAGNOSTICS ---\n')

    // 1. Test MongoDB
    const uri = process.env.MONGODB_URI
    console.log(`Testing MongoDB URI: ${uri.replace(/:([^@]+)@/, ':****@')}`)

    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
        console.log('✅ MongoDB Connection: SUCCESS\n')
        await mongoose.disconnect()
    } catch (err) {
        console.error('❌ MongoDB Connection: FAILED')
        console.error(`   Error message: ${err.message}`)
        console.error(`   Error code: ${err.code || 'N/A'}`)
        if (err.message.includes('Authentication failed')) {
            console.log(
                '\n   [TIP] This usually means wrong credentials OR the IP is not whitelisted in Atlas.'
            )
        }
        console.log('')
    }

    // 2. Test Docker
    console.log(`Testing Docker Host: ${process.env.DOCKER_HOST}`)
    const dockerOptions = {}
    if (process.env.DOCKER_HOST) {
        if (process.env.DOCKER_HOST.startsWith('http')) {
            const url = new URL(process.env.DOCKER_HOST)
            dockerOptions.host = url.hostname
            dockerOptions.port = url.port || 2375
            dockerOptions.protocol = url.protocol.replace(':', '')
        } else {
            dockerOptions.socketPath = process.env.DOCKER_HOST
        }
    }

    const docker = new Docker(dockerOptions)
    try {
        await docker.ping()
        console.log('✅ Docker Connection: SUCCESS\n')
    } catch (err) {
        console.error('❌ Docker Connection: FAILED')
        console.error(`   Error message: ${err.message}\n`)
        console.log(
            '   [TIP] On Windows, if using docker-proxy, Ensure port 2375 is mapped in docker-compose.yml.\n'
        )
    }

    process.exit(0)
}

testConnections()
