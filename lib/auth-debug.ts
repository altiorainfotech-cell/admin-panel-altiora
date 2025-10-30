import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function debugAuthToken(request: NextRequest) {
  const cookies = request.cookies.getAll()
  const headers = Object.fromEntries(request.headers.entries())
  
  console.log('Auth Debug Info:', {
    environment: process.env.NODE_ENV,
    url: request.url,
    method: request.method,
    cookies: cookies.map(c => ({ name: c.name, hasValue: !!c.value })),
    authHeaders: {
      authorization: headers.authorization ? 'present' : 'missing',
      'x-csrf-token': headers['x-csrf-token'] ? 'present' : 'missing'
    },
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET
  })

  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token'
    })

    console.log('Token Result:', {
      hasToken: !!token,
      tokenData: token ? {
        userId: token.userId,
        email: token.email,
        role: token.role,
        status: token.status,
        exp: token.exp
      } : null
    })

    return token
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}