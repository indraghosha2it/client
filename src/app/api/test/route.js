// src/app/api/test/route.js
export async function GET() {
  return new Response(JSON.stringify({
    message: "API is working",
    timestamp: new Date().toISOString(),
    ssl: process.env.NODE_ENV
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}