const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(
    `mongodb://${process.env.MONGO_USER}:${
        process.env.MONGO_PASS
    }@mongo01-tntap-shard-00-00-r09es.mongodb.net:27017,mongo01-tntap-shard-00-01-r09es.mongodb.net:27017,mongo01-tntap-shard-00-02-r09es.mongodb.net:27017/${
        process.env.MONGO_DB
    }?ssl=true&replicaSet=mongo01-tntap-shard-0&authSource=admin`,
    {
        keepAlive: 120,
        reconnectTries: Number.MAX_VALUE,
        reconnectInterval: 500,
        poolSize: 100,
        bufferMaxEntries: 0
    }
);

process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.log('Mongoose disconnected on app termination');
        process.exit(0);
    });
});
