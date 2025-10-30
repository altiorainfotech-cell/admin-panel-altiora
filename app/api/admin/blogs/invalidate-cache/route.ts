import { NextRequest, NextResponse } from 'next/server';
import { withServerErrorHandler, createSuccessResponse } from '@/lib/server-error-handler';
import { BlogCacheManager } from '@/lib/blog-cache';
import { requirePermission } from '@/lib/permission-middleware';

// POST /api/admin/blogs/invalidate-cache - Invalidate blog cache
export const POST = withServerErrorHandler(async (request: NextRequest) => {
  // Check permissions first
  await requirePermission(request, 'blogs', 'write');
  
  try {
    // Invalidate all blog-related cache
    BlogCacheManager.invalidateAll();
    
    // Also try to invalidate Altiora website cache if possible
    const altioraUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    try {
      // Try to trigger revalidation on Altiora website
      const revalidateResponse = await fetch(`${altioraUrl}/api/revalidate?path=/blog`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000)
      });
      
      if (revalidateResponse.ok) {
        console.log('✅ Successfully triggered Altiora blog revalidation');
      } else {
        console.log('⚠️ Altiora revalidation endpoint not available or failed');
      }
    } catch (revalidateError) {
      console.log('⚠️ Could not trigger Altiora revalidation:', revalidateError);
      // This is not critical, so we don't throw
    }
    
    return createSuccessResponse(
      { 
        message: 'Blog cache invalidated successfully',
        timestamp: new Date().toISOString()
      },
      'Cache invalidated successfully'
    );
  } catch (error) {
    console.error('Error invalidating cache:', error);
    throw new Error('Failed to invalidate cache');
  }
}, { action: 'INVALIDATE_BLOG_CACHE' });