// test-mongo-fix.js
const { MongoClient } = require('mongodb');

// Try different connection strings
const connectionStrings = [
  // Option 1: Current SRV with SSL fix
  "mongodb+srv://indraghosha2it_db_user:M5xSo8mbYIaYP4zR@cluster0.bqbhvfb.mongodb.net/office-cost-site?retryWrites=true&w=majority&tls=true&tlsAllowInvalidCertificates=true",
  
  // Option 2: Without SRV
  "mongodb://indraghosha2it_db_user:M5xSo8mbYIaYP4zR@ac-rxvzxnn-shard-00-00.bqbhvfb.mongodb.net:27017,ac-rxvzxnn-shard-00-01.bqbhvfb.mongodb.net:27017,ac-rxvzxnn-shard-00-02.bqbhvfb.mongodb.net:27017/office-cost-site?ssl=true&replicaSet=atlas-yhwe8h-shard-0&authSource=admin&retryWrites=true&w=majority&tlsAllowInvalidCertificates=true",
  
  // Option 3: Direct to primary
  "mongodb://indraghosha2it_db_user:M5xSo8mbYIaYP4zR@ac-rxvzxnn-shard-00-00.bqbhvfb.mongodb.net:27017/office-cost-site?ssl=true&authSource=admin&retryWrites=true&w=majority&tlsAllowInvalidCertificates=true"
];

async function testConnection(uri, name) {
  console.log(`\n🔍 Testing: ${name}`);
  console.log(`URI: ${uri.substring(0, 50)}...`);
  
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });
  
  try {
    await client.connect();
    console.log('✅ CONNECTION SUCCESSFUL!');
    
    const db = client.db();
    console.log(`📊 Database: ${db.databaseName}`);
    
    const collections = await db.listCollections().toArray();
    console.log(`📁 Collections: ${collections.length}`);
    
    if (collections.length > 0) {
      console.log('Collection names:', collections.map(c => c.name));
    }
    
    return true;
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
    return false;
  } finally {
    await client.close();
  }
}

async function runTests() {
  console.log('🚀 MongoDB Connection Tests');
  console.log('===========================');
  
  let success = false;
  
  for (let i = 0; i < connectionStrings.length; i++) {
    success = await testConnection(connectionStrings[i], `Option ${i + 1}`);
    if (success) {
      console.log(`\n🎉 Use Option ${i + 1} in your .env.local file!`);
      break;
    }
  }
  
  if (!success) {
    console.log('\n⚠️  All connection attempts failed.');
    console.log('\nNext steps:');
    console.log('1. Check your MongoDB Atlas cluster is running');
    console.log('2. Verify your IP is whitelisted (0.0.0.0/0 for testing)');
    console.log('3. Check database user permissions');
  }
}

runTests();