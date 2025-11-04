import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { IPermissions } from '@/lib/models/AdminUser'
import { getDatabase } from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any
    const userRole = user.role as 'admin' | 'seo' | 'custom'
    const userPermissions = user.permissions as IPermissions | undefined

    if (!hasPermission(userPermissions, userRole, 'services', 'read')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const db = await getDatabase()
    const collection = db.collection('aimlservices')

    const services = await collection
      .find({})
      .project({
        serviceType: 1,
        heroSection: 1,
        seoMetadata: 1,
        updatedAt: 1
      })
      .sort({ updatedAt: -1 })
      .toArray()

    return NextResponse.json({ 
      success: true, 
      services,
      count: services.length 
    })

  } catch (error) {
    console.error('Error fetching AI/ML services:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    )
  }
}