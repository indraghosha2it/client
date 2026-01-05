// // src/app/api/signup/route.js - UPDATED FOR MONGODB ATLAS
// import { NextResponse } from 'next/server';
// import { MongoClient } from 'mongodb';

// export async function POST(request) {
//   console.log('🚀 POST /api/signup - START');
  
//   try {
//     // Parse the request body
//     let data;
//     try {
//       data = await request.json();
//       console.log('📥 Request data received:', { 
//         name: data.name, 
//         email: data.email,
//         role: data.role 
//       });
//     } catch (parseError) {
//       console.error('❌ Failed to parse JSON:', parseError);
//       return NextResponse.json(
//         { message: "Invalid JSON in request body" },
//         { status: 400 }
//       );
//     }
    
//     // Validate required fields
//     if (!data.name?.trim()) {
//       return NextResponse.json(
//         { message: "Name is required" },
//         { status: 400 }
//       );
//     }
    
//     if (!data.email?.trim()) {
//       return NextResponse.json(
//         { message: "Email is required" },
//         { status: 400 }
//       );
//     }
    
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(data.email)) {
//       return NextResponse.json(
//         { message: "Please enter a valid email address" },
//         { status: 400 }
//       );
//     }
    
//     if (!data.password) {
//       return NextResponse.json(
//         { message: "Password is required" },
//         { status: 400 }
//       );
//     }
    
//     if (data.password.length < 8) {
//       return NextResponse.json(
//         { message: "Password must be at least 8 characters" },
//         { status: 400 }
//       );
//     }
    
//     if (!data.role) {
//       return NextResponse.json(
//         { message: "Role is required" },
//         { status: 400 }
//       );
//     }
    
//     // Get MongoDB URI from environment
//     const uri = process.env.MONGODB_URI;
//     console.log('🔍 MONGODB_URI exists:', !!uri);
    
//     if (!uri) {
//       console.error('❌ MONGODB_URI is not set in environment variables');
//       return NextResponse.json(
//         { 
//           message: "Server configuration error",
//           details: "Database connection string is missing"
//         },
//         { status: 500 }
//       );
//     }
    
//     // Connect to MongoDB Atlas
//     console.log('🔗 Connecting to MongoDB Atlas...');
    
//     // For MongoDB Atlas, use these options
//     const client = new MongoClient(uri, {
//       // MongoDB Atlas requires TLS/SSL
//       tls: true,
//       // Increase timeouts for Atlas
//       serverSelectionTimeoutMS: 30000,
//       connectTimeoutMS: 30000,
//       socketTimeoutMS: 45000,
//     });
    
//     let connectionSuccessful = false;
    
//     try {
//       await client.connect();
//       connectionSuccessful = true;
//       console.log('✅ Successfully connected to MongoDB Atlas');
      
//       // Get database and collection
//       const db = client.db('office-cost-site');
//       const usersCollection = db.collection('users');
      
//       console.log(`📁 Database: office-cost-site`);
//       console.log(`📄 Collection: users`);
      
//       // Check if user already exists
//       const existingUser = await usersCollection.findOne({
//         email: data.email.toLowerCase().trim()
//       });
      
//       if (existingUser) {
//         console.log('⚠️ User already exists with email:', data.email);
//         return NextResponse.json(
//           { 
//             message: "User with this email already exists",
//             suggestion: "Try logging in instead or use a different email"
//           },
//           { status: 409 }
//         );
//       }
      
//       // Create user document
//       const userDoc = {
//         name: data.name.trim(),
//         email: data.email.toLowerCase().trim(),
//         password: data.password, // Note: In production, hash this password!
//         role: data.role,
     
//       };
      
//       console.log('➕ Inserting new user document...');
      
//       // Insert the user
//       const result = await usersCollection.insertOne(userDoc);
      
//       console.log('✅ User created successfully:', {
//         insertedId: result.insertedId,
//         name: userDoc.name,
//         email: userDoc.email
//       });
      
//       // Return success response
//       return NextResponse.json({
//         success: true,
//         message: "Account created successfully!",
//         data: {
//           userId: result.insertedId.toString(),
//           name: userDoc.name,
//           email: userDoc.email,
//           role: userDoc.role
//         },
//         redirect: "/"
//       }, { status: 201 });
      
//     } catch (dbError) {
//       console.error('❌ Database operation failed:', dbError.message);
      
//       // Handle specific MongoDB errors
//       if (dbError.name === 'MongoServerError') {
//         if (dbError.code === 11000) {
//           return NextResponse.json(
//             { message: "User already exists (duplicate key)" },
//             { status: 409 }
//           );
//         }
//       }
      
//       // Handle connection errors
//       if (!connectionSuccessful) {
//         return NextResponse.json(
//           { 
//             message: "Failed to connect to database",
//             details: dbError.message,
//             suggestion: "Please check your MongoDB Atlas connection settings and IP whitelist"
//           },
//           { status: 500 }
//         );
//       }
      
//       throw dbError;
//     } finally {
//       // Always close the connection
//       if (client) {
//         await client.close();
//         console.log('🔌 MongoDB connection closed');
//       }
//     }
    
//   } catch (error) {
//     console.error('❌ Unexpected error in signup:', error);
//     console.error('Error stack:', error.stack);
    
//     return NextResponse.json(
//       { 
//         message: "An unexpected error occurred",
//         error: process.env.NODE_ENV === 'development' ? error.message : undefined,
//         timestamp: new Date().toISOString()
//       },
//       { status: 500 }
//     );
//   }
// }

// // GET endpoint for testing
// export async function GET(request) {
//   console.log('🔍 GET /api/signup - Testing endpoint');
  
//   try {
//     const uri = process.env.MONGODB_URI;
    
//     if (!uri) {
//       return NextResponse.json({
//         status: "error",
//         message: "MONGODB_URI is not configured",
//         timestamp: new Date().toISOString()
//       }, { status: 500 });
//     }
    
//     // Test the connection
//     const client = new MongoClient(uri, {
//       tls: true,
//       serverSelectionTimeoutMS: 10000
//     });
    
//     await client.connect();
    
//     const db = client.db('office-cost-site');
//     const collections = await db.listCollections().toArray();
//     const usersCount = await db.collection('users').countDocuments();
    
//     await client.close();
    
//     return NextResponse.json({
//       status: "success",
//       message: "API is working and connected to MongoDB Atlas",
//       database: "office-cost-site",
//       collections: collections.map(c => c.name),
//       totalUsers: usersCount,
//       timestamp: new Date().toISOString()
//     });
    
//   } catch (error) {
//     console.error('❌ GET test failed:', error);
    
//     return NextResponse.json({
//       status: "error",
//       message: "Failed to connect to MongoDB Atlas",
//       error: error.message,
//       suggestion: "Check your MONGODB_URI, internet connection, and MongoDB Atlas IP whitelist",
//       timestamp: new Date().toISOString()
//     }, { status: 500 });
//   }
// }


// src/app/api/signup/route.js
import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  console.log('🚀 POST /api/signup - START');
  
  try {
    // Parse the request body
    let data;
    try {
      data = await request.json();
      console.log('📥 Request data received:', { 
        name: data.name, 
        email: data.email,
        role: data.role 
      });
    } catch (parseError) {
      console.error('❌ Failed to parse JSON:', parseError);
      return NextResponse.json(
        { message: "Invalid JSON in request body" },
        { status: 400 }
      );
    }
    
    // Validate required fields
    if (!data.name?.trim()) {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 }
      );
    }
    
    if (!data.email?.trim()) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { message: "Please enter a valid email address" },
        { status: 400 }
      );
    }
    
    if (!data.password) {
      return NextResponse.json(
        { message: "Password is required" },
        { status: 400 }
      );
    }
    
    if (data.password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }
    
    if (!data.role) {
      return NextResponse.json(
        { message: "Role is required" },
        { status: 400 }
      );
    }
    
    // Get MongoDB URI from environment
    const uri = process.env.MONGODB_URI;
    console.log('🔍 MONGODB_URI exists:', !!uri);
    
    if (!uri) {
      console.error('❌ MONGODB_URI is not set in environment variables');
      return NextResponse.json(
        { 
          message: "Server configuration error",
          details: "Database connection string is missing"
        },
        { status: 500 }
      );
    }
    
    // Connect to MongoDB Atlas
    console.log('🔗 Connecting to MongoDB Atlas...');
    
    // For MongoDB Atlas, use these options
    const client = new MongoClient(uri, {
      // MongoDB Atlas requires TLS/SSL
      tls: true,
      // Increase timeouts for Atlas
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    
    let connectionSuccessful = false;
    
    try {
      await client.connect();
      connectionSuccessful = true;
      console.log('✅ Successfully connected to MongoDB Atlas');
      
      // Get database and collection
      const db = client.db('office-cost-site');
      const usersCollection = db.collection('users');
      
      console.log(`📁 Database: office-cost-site`);
      console.log(`📄 Collection: users`);
      
      // Check if user already exists
      const existingUser = await usersCollection.findOne({
        email: data.email.toLowerCase().trim()
      });
      
      if (existingUser) {
        console.log('⚠️ User already exists with email:', data.email);
        return NextResponse.json(
          { 
            message: "User with this email already exists",
            suggestion: "Try logging in instead or use a different email"
          },
          { status: 409 }
        );
      }
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);
      
      // Create user document
      const userDoc = {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        password: hashedPassword,
        role: data.role,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('➕ Inserting new user document...');
      
      // Insert the user
      const result = await usersCollection.insertOne(userDoc);
      
      console.log('✅ User created successfully:', {
        insertedId: result.insertedId,
        name: userDoc.name,
        email: userDoc.email
      });
      
      // Return success response
      return NextResponse.json({
        success: true,
        message: "Account created successfully!",
        data: {
          userId: result.insertedId.toString(),
          name: userDoc.name,
          email: userDoc.email,
          role: userDoc.role
        },
        redirect: "/"
      }, { status: 201 });
      
    } catch (dbError) {
      console.error('❌ Database operation failed:', dbError.message);
      
      // Handle specific MongoDB errors
      if (dbError.name === 'MongoServerError') {
        if (dbError.code === 11000) {
          return NextResponse.json(
            { message: "User already exists (duplicate key)" },
            { status: 409 }
          );
        }
      }
      
      // Handle connection errors
      if (!connectionSuccessful) {
        return NextResponse.json(
          { 
            message: "Failed to connect to database",
            details: dbError.message,
            suggestion: "Please check your MongoDB Atlas connection settings and IP whitelist"
          },
          { status: 500 }
        );
      }
      
      throw dbError;
    } finally {
      // Always close the connection
      if (client) {
        await client.close();
        console.log('🔌 MongoDB connection closed');
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error in signup:', error);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json(
      { 
        message: "An unexpected error occurred",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing
export async function GET(request) {
  console.log('🔍 GET /api/signup - Testing endpoint');
  
  try {
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      return NextResponse.json({
        status: "error",
        message: "MONGODB_URI is not configured",
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
    // Test the connection
    const client = new MongoClient(uri, {
      tls: true,
      serverSelectionTimeoutMS: 10000
    });
    
    await client.connect();
    
    const db = client.db('office-cost-site');
    const collections = await db.listCollections().toArray();
    const usersCount = await db.collection('users').countDocuments();
    
    await client.close();
    
    return NextResponse.json({
      status: "success",
      message: "API is working and connected to MongoDB Atlas",
      database: "office-cost-site",
      collections: collections.map(c => c.name),
      totalUsers: usersCount,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ GET test failed:', error);
    
    return NextResponse.json({
      status: "error",
      message: "Failed to connect to MongoDB Atlas",
      error: error.message,
      suggestion: "Check your MONGODB_URI, internet connection, and MongoDB Atlas IP whitelist",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}