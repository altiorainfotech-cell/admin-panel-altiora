import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { ActivityLogger } from '@/lib/activity-logger'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (session?.user) {
      // Log logout activity
      await ActivityLogger.logLogout(
        session.user.email || '',
        session.user.id
      )
    }

    // Create response with cache-busting headers
    const response = NextResponse.json({ success: true })
    
    // Add cache-busting headers to prevent caching of logout response
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    // Clear all NextAuth cookies
    const cookieNames = [
      'next-auth.session-token',
      '__Secure-next-auth.session-token',
      'next-auth.csrf-token',
      '__Host-next-auth.csrf-token',
      'next-auth.callback-url',
      '__Secure-next-auth.callback-url'
    ]
    
    cookieNames.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
    })
    
    // Also clear CSRF token
    response.cookies.set('csrf-token', '', {
      expires: new Date(0),
      path: '/',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}