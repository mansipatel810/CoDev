const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: 'codev',                   // explicit DB name instead of default 'test'
            serverSelectionTimeoutMS: 5000,    // fail fast if Atlas is unreachable (was 30s)
            connectTimeoutMS: 10000,           // max time to open a new connection
            socketTimeoutMS: 45000,            // max time waiting for a query response
            maxPoolSize: 10,                   // max parallel connections
            heartbeatFrequencyMS: 10000,       // ping Atlas every 10s to keep connections alive
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1); // crash loudly instead of running with no DB
    }
}

// Log connection events so dropped connections are visible in the console
mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected — will auto-reconnect...');
});
mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected successfully');
});
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
});

module.exports = connectDB;
