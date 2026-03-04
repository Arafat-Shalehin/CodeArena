const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })
console.log('Connecting to:', process.env.MONGODB_URI)
mongoose
    .connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000, family: 4 })
    .then(() => {
        console.log('Connected')
        process.exit(0)
    })
    .catch((err) => {
        console.error('Error:', err.message)
        process.exit(1)
    })
