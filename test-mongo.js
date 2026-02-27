const mongoose = require('mongoose')

const uri =
    'mongodb://CodeArenaAdmin:CSb7y4KBtTSA0kKc@ac-lxk2eng-shard-00-00.b5xdndi.mongodb.net:27017,ac-lxk2eng-shard-00-01.b5xdndi.mongodb.net:27017,ac-lxk2eng-shard-00-02.b5xdndi.mongodb.net:27017/CodeArena?appName=Crud-Server&ssl=true&replicaSet=atlas-lxk2eng-shard-0&authSource=admin'

mongoose
    .connect(uri)
    .then(() => {
        console.log('Connected successfully using direct connection string!')
        process.exit(0)
    })
    .catch((err) => {
        console.error('Connection failed:', err)
        process.exit(1)
    })
