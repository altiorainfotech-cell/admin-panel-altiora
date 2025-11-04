import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { IPermissions } from '@/lib/models/AdminUser'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'



// GET - Fetch specific service
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ serviceType: string }> }
) {
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

    const { serviceType } = await params
    const db = await getDatabase()
    const collection = db.collection('aimlservices')

    const service = await collection.findOne({ serviceType })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      service 
    })

  } catch (error) {
    console.error('Error fetching AI/ML service:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    )
  }
}

// PUT - Update existing service
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ serviceType: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any
    const userRole = user.role as 'admin' | 'seo' | 'custom'
    const userPermissions = user.permissions as IPermissions | undefined

    if (!hasPermission(userPermissions, userRole, 'services', 'write')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { serviceType } = await params
    const body = await request.json()

    const db = await getDatabase()
    const collection = db.collection('aimlservices')

    // Remove _id from body to prevent immutable field error
    const { _id, ...updateData } = body
    updateData.updatedAt = new Date()

    const result = await collection.findOneAndUpdate(
      { serviceType },
      { $set: updateData },
      { returnDocument: 'after' }
    )

    if (!result) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      service: result,
      message: 'Service updated successfully'
    })

  } catch (error) {
    console.error('Error updating AI/ML service:', error)
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    )
  }
}

// POST - Create new service
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ serviceType: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any
    const userRole = user.role as 'admin' | 'seo' | 'custom'
    const userPermissions = user.permissions as IPermissions | undefined

    if (!hasPermission(userPermissions, userRole, 'services', 'write')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { serviceType } = await params
    const body = await request.json()

    const db = await getDatabase()
    const collection = db.collection('aimlservices')

    // Check if service already exists
    const existingService = await collection.findOne({ serviceType })
    if (existingService) {
      return NextResponse.json(
        { error: 'Service with this type already exists' },
        { status: 409 }
      )
    }

    // Remove _id from body to prevent issues
    const { _id, ...cleanBody } = body
    const serviceData = {
      ...cleanBody,
      serviceType,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await collection.insertOne(serviceData)
    const service = await collection.findOne({ _id: result.insertedId })

    return NextResponse.json({ 
      success: true, 
      service,
      message: 'Service created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating AI/ML service:', error)
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    )
  }
}

// DELETE - Delete service
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ serviceType: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any
    const userRole = user.role as 'admin' | 'seo' | 'custom'
    const userPermissions = user.permissions as IPermissions | undefined

    if (!hasPermission(userPermissions, userRole, 'services', 'delete')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { serviceType } = await params
    const db = await getDatabase()
    const collection = db.collection('aimlservices')

    const result = await collection.findOneAndDelete({ serviceType })

    if (!result) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Service deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting AI/ML service:', error)
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    )
  }
}