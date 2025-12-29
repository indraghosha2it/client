// test-mongo.js (in project root)
require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function testMongoDB() {
  const uri = process.env.MONGODB_URI;
  
  console.log('🧪 Testing MongoDB Connection...\n');
  
  if (!uri) {
    console.log('❌ MONGODB_URI not found in .env.local');
    return;
  }
  
  // Hide password
  const safeUri = uri.replace(/mongodb\+srv:\/\/([^:]+):[^@]+@/, 'mongodb+srv://$1:****@');
  console.log('🔗 Using:', safeUri);
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas!');
    
    const db = client.db();
    await db.command({ ping: 1 });
    console.log('✅ Database ping successful');
    
    // List databases
    const dbs = await client.db().admin().listDatabases();
    console.log('\n📊 Available databases:');
    dbs.databases.forEach(db => console.log(`  - ${db.name}`));
    
    // Check users collection
    const usersCollection = db.collection('users');
    const count = await usersCollection.countDocuments();
    console.log(`\n📄 Users in collection: ${count}`);
    
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    console.log('\n🔧 To fix MongoDB Atlas connection:');
    console.log('1. Go to https://cloud.mongodb.com/');
    console.log('2. Select your cluster → Connect → Connect your application');
    console.log('3. Copy the connection string');
    console.log('4. Update .env.local with correct username/password');
    console.log('5. Go to Network Access → Add IP Address (add your IP or 0.0.0.0/0 temporarily)');
  } finally {
    await client.close();
  }
}

testMongoDB();