import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/database/connection'
import AdminUser from '@/lib/models/AdminUser'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const user = session.user as any
    
    // Get fresh user data from database
    const dbUser = await AdminUser.findById(user.id).lean()
    
    return NextResponse.json({
      session: {
        id: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      },
      database: dbUser ? {
        _id: dbUser._id,
        email: dbUser.email,
        role: dbUser.role,
        permissions: dbUser.permissions,
        status: dbUser.status
      } : null,
      debug: {
        sessionExists: !!session,
        userExists: !!user,
        dbUserExists: !!dbUser,
        rolesMatch: user.role === dbUser?.role
      }
    })
  } catch (error) {
    console.error('User info error:', error)
    return NextResponse.json(
      { error: 'Failed to get user info', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}