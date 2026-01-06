// src/app/api/me/route.js
import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    // Get token from cookies
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key-change-in-production'
      );
    } catch (error) {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      );
    }
    
    // Connect to MongoDB
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      return NextResponse.json(
        { message: "Database configuration error" },
        { status: 500 }
      );
    }
    
    const client = new MongoClient(uri, {
      tls: true,
      serverSelectionTimeoutMS: 10000
    });
    
    await client.connect();
    const db = client.db('office-cost-site');
    const usersCollection = db.collection('users');
    
    // Get user from database
    const user = await usersCollection.findOne(
      { _id: new ObjectId(decoded.userId) },
      { projection: { password: 0 } } // Exclude password
    );
    
    await client.close();
    
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: {
        userId: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Error in /api/me:', error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}