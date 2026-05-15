const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
    try {
        let uri = process.env.MONGO_URI;
        
        // On Vercel or in Production, always use the real URI
        if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
            const conn = await mongoose.connect(uri);
            console.log(`MongoDB Connected: ${conn.connection.host}`);
            return;
        }

        if (process.env.NODE_ENV === 'development') {
            try {
                // Try to connect to real Mongo first
                await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
                console.log(`MongoDB Connected: ${mongoose.connection.host}`);
                return;
            } catch (err) {
                console.log('Local MongoDB not found. Starting In-Memory MongoDB for development...');
                const mongod = await MongoMemoryServer.create();
                uri = mongod.getUri();
            }
        }

        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected (Dev/Memory): ${conn.connection.host}`);
    } catch (error) {
        console.error(`Database Connection Error: ${error.message}`);
        // Don't exit process in serverless environment
        if (!process.env.VERCEL) {
            process.exit(1);
        }
        throw error;
    }
};

module.exports = connectDB;
