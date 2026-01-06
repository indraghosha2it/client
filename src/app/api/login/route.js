// // src/app/api/login/route.js
// import { NextResponse } from 'next/server';
// import bcrypt from 'bcryptjs';
// import { connectDB } from '../../../lib/connectDB';

// export async function POST(request) {
//   console.log('🔐 Login API endpoint called');
  
//   try {
//     // Parse request body
//     const body = await request.json().catch(() => null);
    
//     if (!body) {
//       console.log('❌ Invalid JSON in request body');
//       return NextResponse.json(
//         { error: 'Invalid request format' },
//         { status: 400 }
//       );
//     }
    
//     const { email, password } = body;
//     console.log('📧 Login attempt for:', email);

//     // Validate input
//     if (!email || !password) {
//       console.log('❌ Missing email or password');
//       return NextResponse.json(
//         { error: 'Email and password are required' },
//         { status: 400 }
//       );
//     }

//     // Connect to database
//     console.log('🔄 Connecting to database...');
//     let db;
//     try {
//       db = await connectDB();
//       console.log('✅ Database connected');
//     } catch (dbError) {
//       console.error('❌ Database connection error:', dbError.message);
//       return NextResponse.json(
//         { error: 'Database connection failed', details: 'Please try again later' },
//         { status: 503 }
//       );
//     }

//     // Find user by email
//     console.log('🔍 Looking for user in database...');
//     const usersCollection = db.collection('users');
//     const user = await usersCollection.findOne({ email: email.trim().toLowerCase() });
    
//     if (!user) {
//       console.log('❌ User not found:', email);
//       return NextResponse.json(
//         { error: 'Invalid email or password' },
//         { status: 401 }
//       );
//     }
    
//     console.log('✅ User found:', {
//       id: user._id,
//       email: user.email,
//       name: user.name,
//       role: user.role
//     });

//     // Check if user has password field
//     if (!user.password) {
//       console.error('❌ User record has no password field');
//       return NextResponse.json(
//         { error: 'Account configuration error' },
//         { status: 500 }
//       );
//     }

//     // Debug: Log password info (remove in production)
//     console.log('🔐 Password verification:', {
//       inputLength: password.length,
//       storedPasswordExists: !!user.password,
//       storedPasswordLength: user.password.length,
//       storedPasswordStartsWith: user.password.substring(0, 20) + '...'
//     });

//     // Verify password
//     console.log('🔑 Comparing passwords...');
//     let isValidPassword;
    
//     try {
//       // Check if password is hashed (bcrypt hashes start with $2)
//       const isHashed = user.password.startsWith('$2');
      
//       if (isHashed) {
//         // Use bcrypt for hashed passwords
//         isValidPassword = await bcrypt.compare(password, user.password);
//         console.log('🔄 Using bcrypt comparison');
//       } else {
//         // For plain text passwords (not recommended)
//         console.log('⚠️ Using plain text comparison (insecure)');
//         isValidPassword = password === user.password;
        
//         // Optional: Upgrade to hashed password
//         if (isValidPassword) {
//           console.log('🔄 Upgrading plain text password to hash...');
//           const hashedPassword = await bcrypt.hash(password, 10);
//           await usersCollection.updateOne(
//             { _id: user._id },
//             { $set: { password: hashedPassword } }
//           );
//           console.log('✅ Password upgraded to hash');
//         }
//       }
//     } catch (compareError) {
//       console.error('❌ Password comparison error:', compareError);
//       return NextResponse.json(
//         { error: 'Authentication error' },
//         { status: 500 }
//       );
//     }
    
//     console.log('✅ Password valid:', isValidPassword);

//     if (!isValidPassword) {
//       console.log('❌ Invalid password for user:', email);
//       return NextResponse.json(
//         { error: 'Invalid email or password' },
//         { status: 401 }
//       );
//     }

//     // Ensure role is included (default to 'user' if not set)
//     const userRole = user.role || 'user';
    
//     // Remove sensitive data from response
//     const userResponse = {
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       role: userRole,
//       createdAt: user.createdAt,
//       updatedAt: user.updatedAt
//     };
    
//     // Return successful response
//     console.log('🎉 Login successful for:', email, 'Role:', userRole);
//     return NextResponse.json({
//       success: true,
//       user: userResponse,
//       message: 'Login successful',
//       redirectTo: userRole === 'admin' ? '/admin/dashboard' : 
//                   userRole === 'moderator' ? '/moderator/dashboard' : '/dashboard'
//     }, {
//       status: 200,
//       headers: {
//         'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
//         'Pragma': 'no-cache',
//         'Expires': '0'
//       }
//     });

//   } catch (error) {
//     console.error('🔥 Unhandled login error:', error);
//     console.error('Error stack:', error.stack);
    
//     return NextResponse.json(
//       { 
//         error: 'Internal server error',
//         message: error.message,
//         timestamp: new Date().toISOString()
//       },
//       { status: 500 }
//     );
//   }
// }

// // Handle OPTIONS for CORS
// export async function OPTIONS(request) {
//   return new NextResponse(null, {
//     status: 200,
//     headers: {
//       'Access-Control-Allow-Origin': '*',
//       'Access-Control-Allow-Methods': 'POST, OPTIONS',
//       'Access-Control-Allow-Headers': 'Content-Type, Authorization',
//     },
//   });
// }





// src/app/api/login/route.js
import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  console.log('🚀 POST /api/login - START');
  
  try {
    // Parse the request body
    let data;
    try {
      data = await request.json();
      console.log('📥 Login request for email:', data.email);
    } catch (parseError) {
      console.error('❌ Failed to parse JSON:', parseError);
      return NextResponse.json(
        { message: "Invalid JSON in request body" },
        { status: 400 }
      );
    }
    
    // Validate required fields
    if (!data.email?.trim()) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }
    
    if (!data.password) {
      return NextResponse.json(
        { message: "Password is required" },
        { status: 400 }
      );
    }
    
    // Get MongoDB URI from environment
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      console.error('❌ MONGODB_URI is not set');
      return NextResponse.json(
        { 
          message: "Server configuration error",
          details: "Database connection string is missing"
        },
        { status: 500 }
      );
    }
    
    // Connect to MongoDB
    const client = new MongoClient(uri, {
      tls: true,
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    
    try {
      await client.connect();
      console.log('✅ Connected to MongoDB');
      
      const db = client.db('office-cost-site');
      const usersCollection = db.collection('users');
      
      // Find user by email
      const user = await usersCollection.findOne({
        email: data.email.toLowerCase().trim()
      });
      
      if (!user) {
        console.log('❌ User not found:', data.email);
        return NextResponse.json(
          { message: "Invalid email or password" },
          { status: 401 }
        );
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(data.password, user.password);
      
      if (!isPasswordValid) {
        console.log('❌ Invalid password for user:', data.email);
        return NextResponse.json(
          { message: "Invalid email or password" },
          { status: 401 }
        );
      }
      
      // Create JWT token with user role
      const token = jwt.sign(
        {
          userId: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role
        },
        process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        { expiresIn: '24h' }
      );
      
      console.log('✅ Login successful for user:', {
        email: user.email,
        name: user.name,
        role: user.role
      });
      
      // Return success response with role
      const response = NextResponse.json({
        success: true,
        message: "Login successful",
        data: {
          userId: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role
        },
        token: token
      }, { status: 200 });
      
      // Set the token as an HTTP-only cookie
      response.cookies.set({
        name: 'auth_token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/'
      });
      
      return response;
      
    } catch (dbError) {
      console.error('❌ Database operation failed:', dbError.message);
      return NextResponse.json(
        { 
          message: "Database error",
          error: dbError.message
        },
        { status: 500 }
      );
    } finally {
      await client.close();
      console.log('🔌 MongoDB connection closed');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error in login:', error);
    return NextResponse.json(
      { 
        message: "An unexpected error occurred",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}