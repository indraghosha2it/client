// verify-mongo-data.js
require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function verifyData() {
  console.log('🔍 Verifying MongoDB Data...\n');
  
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('office-cost-site');
    const users = db.collection('users');
    
    // Count documents
    const count = await users.countDocuments();
    console.log(`📊 Total users in 'users' collection: ${count}`);
    
    if (count > 0) {
      console.log('\n📄 All users in database:');
      const allUsers = await users.find({}).toArray();
      
      allUsers.forEach((user, index) => {
        console.log(`\n👤 User ${index + 1}:`);
        console.log(`   ID: ${user._id}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log(`   Has password: ${!!user.password}`);
      });
    } else {
      console.log('\n❌ No users found in database!');
      console.log('This means signups are not being saved to MongoDB.');
    }
    
    // Check collection stats
    console.log('\n📊 Collection info:');
    const stats = await db.command({ collStats: 'users' });
    console.log(`   Size: ${Math.round(stats.size / 1024)} KB`);
    console.log(`   Count: ${stats.count}`);
    console.log(`   Storage: ${stats.storageSize} bytes`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

verifyData();