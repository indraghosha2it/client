// import { NextResponse } from 'next/server';

// export async function POST() {
//   const response = NextResponse.json(
//     { message: 'Logged out successfully' },
//     { status: 200 }
//   );

//   // Clear the token cookie
//   response.cookies.delete('token');
  
//   return response;
// }


// src/app/api/logout/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    console.log('🚀 POST /api/logout - START');
    
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully"
    });
    
    // Clear the auth cookie
    response.cookies.set({
      name: 'auth_token',
      value: '',
      httpOnly: true,
      expires: new Date(0),
      path: '/'
    });
    
    console.log('✅ Logout successful');
    return response;
  } catch (error) {
    console.error('❌ Logout error:', error);
    return NextResponse.json(
      { message: "Logout failed" },
      { status: 500 }
    );
  }
}

// GET method for testing
export async function GET() {
  return NextResponse.json({
    message: "Logout endpoint. Use POST method to logout."
  });
}