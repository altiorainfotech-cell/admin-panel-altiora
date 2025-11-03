import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/database/connection'
import SEOPage from '@/lib/models/SEOPage'
import { canAccessPage } from '@/lib/permissions'
import { logger } from '@/lib/logger'
import { createAuditLog } from '@/lib/utils/audit-logger'

// Helper function to get nested values
function getNestedValue(obj: any, path: string): any {
  if (!obj || typeof obj !== 'object') return undefined
  
  const keys = path.split('.')
  let current = obj
  
  for (const key of keys) {
    if (current === null || current === undefined) return undefined
    current = current[key]
  }
  
  return current
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any
    if (!canAccessPage(user.permissions, user.role, 'seo')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await connectToDatabase()

    // Await params for Next.js 15 compatibility
    const { path: originalPath } = await params

    // Handle multiple levels of URL encoding
    let path = originalPath
    try {
      // Decode multiple times if needed
      while (path !== decodeURIComponent(path)) {
        path = decodeURIComponent(path)
      }
    } catch (e) {
      logger.error('Error decoding path:', { error: e instanceof Error ? e.message : String(e) })
      path = originalPath
    }

    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId') || 'altiorainfotech'

    logger.info('Looking for SEO page:', { siteId, path, originalPath })

    const seoPage = await SEOPage.findOne({ siteId, path }).lean()

    if (!seoPage) {
      logger.info('SEO page not found:', { siteId, path })
      return NextResponse.json({ error: 'SEO page not found' }, { status: 404 })
    }

    return NextResponse.json(seoPage)
  } catch (error) {
    logger.error('Error fetching SEO page:', { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: 'Failed to fetch SEO page', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any
    if (!canAccessPage(user.permissions, user.role, 'seo')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await connectToDatabase()

    // Await params for Next.js 15 compatibility
    const { path: originalPath } = await params

    // Handle multiple levels of URL encoding
    let path = originalPath
    try {
      // Decode multiple times if needed
      while (path !== decodeURIComponent(path)) {
        path = decodeURIComponent(path)
      }
    } catch (e) {
      logger.error('Error decoding path:', { error: e instanceof Error ? e.message : String(e) })
      path = originalPath
    }

    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId') || 'altiorainfotech'

    const result = await SEOPage.findOneAndDelete({ siteId, path })

    if (!result) {
      logger.info('SEO page not found for deletion:', { siteId, path })
      return NextResponse.json({ error: 'SEO page not found' }, { status: 404 })
    }

    // Create audit log for reset/delete action
    const userId = String(user.id || user._id || 'system')
    
    // Track what was deleted
    const fieldsToTrack = [
      'metaTitle',
      'metaDescription', 
      'slug',
      'robots',
      'openGraph.title',
      'openGraph.description',
      'openGraph.image'
    ]
    
    const changes = fieldsToTrack.map(field => ({
      field,
      oldValue: getNestedValue(result, field),
      newValue: null
    })).filter(change => change.oldValue !== null && change.oldValue !== undefined)

    if (changes.length > 0) {
      await createAuditLog({
        siteId,
        action: 'reset',
        entityType: 'seo_page',
        entityId: result._id.toString(),
        path,
        changes,
        metadata: {
          userAgent: request.headers.get('user-agent') || undefined,
          ipAddress: request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
        },
        performedBy: userId
      })
    }

    logger.info('SEO page deleted:', { path, userId: user.id, changesCount: changes.length })

    return NextResponse.json({ message: 'SEO page deleted successfully' })
  } catch (error) {
    logger.error('Error deleting SEO page:', { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: 'Failed to delete SEO page', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}