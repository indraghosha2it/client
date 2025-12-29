// test-connection.js
const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://indraghosha2it_db_user:M5xSo8mbYIaYP4zR@cluster0.bqbhvfb.mongodb.net/office-cost-site?retryWrites=true&w=majority";

async function testConnection() {
  console.log('Testing MongoDB Atlas connection...');
  
  const client = new MongoClient(uri, {
    tls: true,
    serverSelectionTimeoutMS: 5000
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas!');
    
    const db = client.db('office-cost-site');
    const collections = await db.listCollections().toArray();
    
    console.log(`Database: ${db.databaseName}`);
    console.log(`Collections: ${collections.map(c => c.name).join(', ')}`);
    
    // Test insert
    const users = db.collection('users');
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'test123',
      role: 'moderator',
      createdAt: new Date()
    };
    
    const result = await users.insertOne(testUser);
    console.log(`✅ Insert test successful, ID: ${result.insertedId}`);
    
    // Clean up
    await users.deleteOne({ _id: result.insertedId });
    console.log('🧹 Test data cleaned up');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.error('   ↳ DNS lookup failed. Check your internet connection.');
    } else if (error.message.includes('ETIMEDOUT')) {
      console.error('   ↳ Connection timeout. Check firewall settings.');
    } else if (error.message.includes('unauthorized')) {
      console.error('   ↳ Authentication failed. Check username/password.');
    } else if (error.message.includes('SSL')) {
      console.error('   ↳ SSL/TLS issue. Try updating Node.js or MongoDB driver.');
    }
    
  } finally {
    await client.close();
    console.log('Connection closed.');
  }
}

testConnection();