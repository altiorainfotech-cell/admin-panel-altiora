import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { IPermissions } from '@/lib/models/AdminUser'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any
    const userRole = user.role as 'admin' | 'seo' | 'custom'
    const userPermissions = user.permissions as IPermissions | undefined

    // Check if user has write permissions for services (or any write permission)
    if (!hasPermission(userPermissions, userRole, 'services', 'write') && 
        !hasPermission(userPermissions, userRole, 'blogs', 'write')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
    }

    // Upload to Cloudinary
    const cloudinaryFormData = new FormData()
    cloudinaryFormData.append('file', file)
    cloudinaryFormData.append('upload_preset', 'admin-panel-uploads') // We'll create this preset
    cloudinaryFormData.append('folder', 'admin-panel') // Organize uploads in a folder

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: cloudinaryFormData,
      }
    )

    if (!cloudinaryResponse.ok) {
      const errorData = await cloudinaryResponse.json()
      console.error('Cloudinary upload error:', errorData)
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
    }

    const cloudinaryData = await cloudinaryResponse.json()

    return NextResponse.json({
      success: true,
      url: cloudinaryData.secure_url,
      publicId: cloudinaryData.public_id
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}