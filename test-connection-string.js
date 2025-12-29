// test-connection-string.js
require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function test() {
  console.log('🔍 Testing your exact connection string...\n');
  
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.log('❌ No MONGODB_URI in .env.local');
    return;
  }
  
  console.log('📝 Your connection string:');
  console.log(uri);
  console.log('\n--- Analysis ---');
  
  // Check for common issues
  if (!uri.includes('/office-cost-site')) {
    console.log('❌ MISSING: Add /office-cost-site after .mongodb.net/');
    console.log('Change: ...mongodb.net/?retryWrites...');
    console.log('To:     ...mongodb.net/office-cost-site?retryWrites...');
  }
  
  if (!uri.includes('retryWrites=true&w=majority')) {
    console.log('❌ MISSING: Add ?retryWrites=true&w=majority parameters');
  }
  
  if (uri.includes('<password>')) {
    console.log('❌ ERROR: Replace <password> with your actual password');
  }
  
  console.log('\n💡 Your connection string should look EXACTLY like:');
  console.log('mongodb+srv://indraghosha2it_db_user:YOUR_ACTUAL_PASSWORD@cluster0.bqbhvfb.mongodb.net/office-cost-site?retryWrites=true&w=majority&appName=Cluster0');
  
  console.log('\n🔗 Testing connection...');
  
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log('✅ Connected!');
    
    const db = client.db('office-cost-site');
    console.log('✅ Using database: office-cost-site');
    
    const collections = await db.listCollections().toArray();
    console.log(`📁 Collections found: ${collections.length}`);
    
    await client.close();
    console.log('\n🎉 Everything is correct! Restart your Next.js server.');
    
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    
    if (error.message.includes('bad auth')) {
      console.log('\n🔧 Solution:');
      console.log('1. Go to MongoDB Atlas → Database Access');
      console.log('2. Check your username and password');
      console.log('3. Reset password if needed');
      console.log('4. Update .env.local with new password');
    }
  }
}

test();