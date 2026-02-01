import mongoose from 'mongoose';

// Define the MongoDB connection string type
type MongoDBConnection = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// Extend the global object to include mongoose cache
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongoDBConnection | undefined;
}

// Get MongoDB URI from environment variables
const MONGODB_URI: string | undefined = process.env.MONGODB_URI;

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
const cached: MongoDBConnection = global.mongoose || {
  conn: null,
  promise: null,
};

// Cache the connection in the global object
if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Establishes a connection to MongoDB using Mongoose
 * 
 * This function implements connection caching to:
 * - Reuse existing connections in serverless environments
 * - Prevent connection exhaustion during development hot reloads
 * - Optimize performance by avoiding redundant connection attempts
 * 
 * @returns Promise that resolves to the Mongoose instance
 */
async function connectDB(): Promise<typeof mongoose> {
  // Return existing connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // Validate that MONGODB_URI is defined before attempting connection
  if (!MONGODB_URI) {
    throw new Error(
      'Please define the MONGODB_URI environment variable inside .env'
    );
  }

  // Create new connection promise if none exists
  if (!cached.promise) {
    const options = {
      bufferCommands: false, // Disable buffering for better error handling
      maxPoolSize: 10, // Maximum number of connections in the pool
      serverSelectionTimeoutMS: 5000, // Timeout for server selection
      socketTimeoutMS: 45000, // Timeout for socket inactivity
    };

    cached.promise = mongoose
      .connect(MONGODB_URI as string, options)
      .then((mongooseInstance) => {
        console.log('✅ MongoDB connected successfully');
        return mongooseInstance;
      })
      .catch((error) => {
        console.error('❌ MongoDB connection error:', error);
        // Reset the promise on error so next attempt can retry
        cached.promise = null;
        throw error;
      });
  }

  try {
    // Await the connection promise and cache the result
    cached.conn = await cached.promise;
  } catch (error) {
    // Reset both promise and connection on failure
    cached.promise = null;
    cached.conn = null;
    throw error;
  }

  return cached.conn;
}

export default connectDB;
