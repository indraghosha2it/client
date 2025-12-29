// src/app/api/login/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '../../../lib/connectDB';

export async function POST(request) {
  console.log('🔐 Login API endpoint called');
  
  try {
    // Parse request body
    const body = await request.json().catch(() => null);
    
    if (!body) {
      console.log('❌ Invalid JSON in request body');
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }
    
    const { email, password } = body;
    console.log('📧 Login attempt for:', email);

    // Validate input
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Connect to database
    console.log('🔄 Connecting to database...');
    let db;
    try {
      db = await connectDB();
      console.log('✅ Database connected');
    } catch (dbError) {
      console.error('❌ Database connection error:', dbError.message);
      return NextResponse.json(
        { error: 'Database connection failed', details: 'Please try again later' },
        { status: 503 }
      );
    }

    // Find user by email
    console.log('🔍 Looking for user in database...');
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ email: email.trim().toLowerCase() });
    
    if (!user) {
      console.log('❌ User not found:', email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    console.log('✅ User found:', {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role
    });

    // Check if user has password field
    if (!user.password) {
      console.error('❌ User record has no password field');
      return NextResponse.json(
        { error: 'Account configuration error' },
        { status: 500 }
      );
    }

    // Debug: Log password info (remove in production)
    console.log('🔐 Password verification:', {
      inputLength: password.length,
      storedPasswordExists: !!user.password,
      storedPasswordLength: user.password.length,
      storedPasswordStartsWith: user.password.substring(0, 20) + '...'
    });

    // Verify password
    console.log('🔑 Comparing passwords...');
    let isValidPassword;
    
    try {
      // Check if password is hashed (bcrypt hashes start with $2)
      const isHashed = user.password.startsWith('$2');
      
      if (isHashed) {
        // Use bcrypt for hashed passwords
        isValidPassword = await bcrypt.compare(password, user.password);
        console.log('🔄 Using bcrypt comparison');
      } else {
        // For plain text passwords (not recommended)
        console.log('⚠️ Using plain text comparison (insecure)');
        isValidPassword = password === user.password;
        
        // Optional: Upgrade to hashed password
        if (isValidPassword) {
          console.log('🔄 Upgrading plain text password to hash...');
          const hashedPassword = await bcrypt.hash(password, 10);
          await usersCollection.updateOne(
            { _id: user._id },
            { $set: { password: hashedPassword } }
          );
          console.log('✅ Password upgraded to hash');
        }
      }
    } catch (compareError) {
      console.error('❌ Password comparison error:', compareError);
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 500 }
      );
    }
    
    console.log('✅ Password valid:', isValidPassword);

    if (!isValidPassword) {
      console.log('❌ Invalid password for user:', email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Ensure role is included (default to 'user' if not set)
    const userRole = user.role || 'user';
    
    // Remove sensitive data from response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: userRole,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    // Return successful response
    console.log('🎉 Login successful for:', email, 'Role:', userRole);
    return NextResponse.json({
      success: true,
      user: userResponse,
      message: 'Login successful',
      redirectTo: userRole === 'admin' ? '/admin/dashboard' : 
                  userRole === 'moderator' ? '/moderator/dashboard' : '/dashboard'
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('🔥 Unhandled login error:', error);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}