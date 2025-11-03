import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/permission-middleware';
import { connectToDatabase } from '@/lib/mongoose';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test auth endpoint called');
    
    // Test authentication
    const user = await requirePermission(request, 'seo', 'read');
    console.log('✅ User authenticated:', { id: user.id, email: user.email, role: user.role });
    
    // Test database connection
    await connectToDatabase();
    console.log('✅ Database connected');
    
    return NextResponse.json({
      success: true,
      message: 'Authentication and database connection working',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('❌ Test auth error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Test failed',
        stack: error.stack 
      },
      { status: error.message?.includes('Access denied') ? 403 : 500 }
    );
  }
}