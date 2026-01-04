import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request) {
  try {
    // Get token from cookies
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { user: null },
        { status: 200 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database (optional - you can also use just the token data)
    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne(
      { _id: decoded.userId },
      { projection: { password: 0 } } // Exclude password
    );

    if (!user) {
      const response = NextResponse.json(
        { user: null },
        { status: 200 }
      );
      response.cookies.delete('token');
      return response;
    }

    return NextResponse.json(
      { user },
      { status: 200 }
    );

  } catch (error) {
    console.error('Auth error:', error);
    const response = NextResponse.json(
      { user: null },
      { status: 200 }
    );
    response.cookies.delete('token');
    return response;
  }
}