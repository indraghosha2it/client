// test-simple.js
const { MongoClient } = require('mongodb');

// Use your actual connection string
const uri = 'mongodb+srv://indraghosha2it_db_user:M5xSo8mbYIaYP4zR@ac-rxvzxnn-shard-00-00.bqbhvfb.mongodb.net/office-cost-site?retryWrites=true&w=majority&ssl=true';

async function test() {
  console.log('Testing with simplified SSL...');
  
  const client = new MongoClient(uri, {
    // Minimal options - let MongoDB driver handle SSL
    serverSelectionTimeoutMS: 10000
  });

  try {
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const db = client.db('office-cost-site');
    const collections = await db.listCollections().toArray();
    console.log(`✅ Database has ${collections.length} collections`);
    
    await client.close();
  } catch (error) {
    console.error('❌ Failed:', error.message);
    
    if (error.message.includes('invalid command')) {
      console.log('\n💡 Windows SSL issue detected. Try this:');
      console.log('1. Update Node.js: Download from nodejs.org');
      console.log('2. Or use this workaround in PowerShell:');
      console.log('   $env:NODE_TLS_REJECT_UNAUTHORIZED=0');
      console.log('   npm run dev');
    }
  }
}

test();