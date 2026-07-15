const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    try {
        let uri = process.env.MONGODB_URI || process.env.MONGO_URI;
        
        // On Vercel or in Production, always use the real URI
        if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
            if (!cached.promise) {
                cached.promise = mongoose.connect(uri).then(m => m);
            }
            cached.conn = await cached.promise;
            console.log(`MongoDB Connected: ${cached.conn.connection.host}`);
            return cached.conn;
        }

        if (process.env.NODE_ENV === 'development') {
            try {
                // Try to connect to real Mongo first
                if (!cached.promise) {
                    cached.promise = mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 }).then(m => m);
                }
                cached.conn = await cached.promise;
                console.log(`MongoDB Connected: ${cached.conn.connection.host}`);
                return cached.conn;
            } catch (err) {
                console.log('Local MongoDB not found. Starting In-Memory MongoDB for development...');
                const mongod = await MongoMemoryServer.create();
                uri = mongod.getUri();
                cached.promise = null; // reset for memory server
            }
        }

        if (!cached.promise) {
            cached.promise = mongoose.connect(uri).then(m => m);
        }
        cached.conn = await cached.promise;
        console.log(`MongoDB Connected (Dev/Memory): ${cached.conn.connection.host}`);
        return cached.conn;
    } catch (error) {
        console.error(`Database Connection Error: ${error.message}`);
        cached.promise = null; // reset on error
        // Don't exit process in serverless environment
        if (!process.env.VERCEL) {
            process.exit(1);
        }
        throw error;
    }
};

module.exports = connectDB;
