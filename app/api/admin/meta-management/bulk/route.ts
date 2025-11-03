import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/database/connection'
import SEOPage from '@/lib/models/SEOPage'
import { canAccessPage } from '@/lib/permissions'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any
    if (!canAccessPage(user.permissions, user.role, 'seo')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { operation, data } = body

    await connectToDatabase()

    let result
    const siteId = 'altiorainfotech'

    switch (operation) {
      case 'bulkUpdate':
        // Update multiple pages
        const updatePromises = data.pages.map((page: any) =>
          SEOPage.findOneAndUpdate(
            { siteId, path: page.path },
            { 
              ...page,
              siteId,
              isCustom: true,
              updatedBy: user.id
            },
            { upsert: true, new: true }
          )
        )
        result = await Promise.all(updatePromises)
        break

      case 'bulkDelete':
        // Delete multiple pages
        result = await SEOPage.deleteMany({
          siteId,
          path: { $in: data.paths }
        })
        break

      case 'bulkReset':
        // Reset multiple pages to default
        result = await SEOPage.deleteMany({
          siteId,
          path: { $in: data.paths },
          isCustom: true
        })
        break

      default:
        return NextResponse.json(
          { error: 'Invalid bulk operation' },
          { status: 400 }
        )
    }

    logger.info('Bulk operation completed:', { 
      operation, 
      affectedCount: Array.isArray(result) ? result.length : result.deletedCount,
      userId: user.id 
    })

    return NextResponse.json({ 
      message: `Bulk ${operation} completed successfully`,
      result
    })
  } catch (error) {
    logger.error('Error executing bulk operation:', { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: 'Failed to execute bulk operation' },
      { status: 500 }
    )
  }
}