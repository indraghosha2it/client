// Updated connectDB.js
import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('❌ MONGODB_URI is not defined in .env.local');
}

// SIMPLIFIED OPTIONS - No sslValidate
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
  // That's it! Let MongoDB driver handle SSL automatically
};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    console.log('🔧 Creating new MongoDB connection...');
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect()
      .then(connectedClient => {
        console.log('✅ MongoDB Atlas connected successfully');
        return connectedClient;
      })
      .catch(error => {
        console.error('❌ MongoDB connection failed:', error.message);
        throw error;
      });
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function connectDB() {
  try {
    const client = await clientPromise;
    const dbName = 'office-cost-site';
    const db = client.db(dbName);
    console.log(`📁 Using database: ${dbName}`);
    return db;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    throw error;
  }
}