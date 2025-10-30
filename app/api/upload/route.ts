import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { debugAuthToken } from '@/lib/auth-debug';

export async function POST(request: NextRequest) {
  try {
    // Debug authentication in production
    const token = await debugAuthToken(request);

    if (!token) {
      // Try alternative authentication method
      const sessionCookie = request.cookies.get(
        process.env.NODE_ENV === 'production' 
          ? '__Secure-next-auth.session-token' 
          : 'next-auth.session-token'
      );
      
      console.log('Fallback auth check:', {
        hasSessionCookie: !!sessionCookie,
        cookieValue: sessionCookie?.value ? 'present' : 'missing'
      });

      return NextResponse.json({
        success: false,
        error: 'Authentication required. Please log in again.',
        debug: {
          environment: process.env.NODE_ENV,
          hasSecret: !!process.env.NEXTAUTH_SECRET,
          hasSessionCookie: !!sessionCookie
        }
      }, { status: 401 });
    }

    if (token.status !== 'active') {
      return NextResponse.json({
        success: false,
        error: 'Account is disabled'
      }, { status: 403 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file provided'
      }, { status: 400 });
    }

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.'
      }, { status: 400 });
    }

    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        error: 'File size too large. Maximum size is 10MB.'
      }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await uploadToCloudinary(buffer, 'blog-images');

    return NextResponse.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to upload image'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication with proper cookie name for production
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token'
    });

    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required. Please log in again.'
      }, { status: 401 });
    }

    if (token.status !== 'active') {
      return NextResponse.json({
        success: false,
        error: 'Account is disabled'
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');

    if (!publicId) {
      return NextResponse.json({
        success: false,
        error: 'Public ID is required'
      }, { status: 400 });
    }

    // Delete from Cloudinary
    const { deleteFromCloudinary } = await import('@/lib/cloudinary');
    await deleteFromCloudinary(publicId);

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete image'
    }, { status: 500 });
  }
}