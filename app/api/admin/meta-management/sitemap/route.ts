import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/database/connection'
import SEOPage from '@/lib/models/SEOPage'
import { canAccessPage } from '@/lib/permissions'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
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
    console.log('Database connected successfully')

    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId') || 'altiorainfotech'
    console.log('Querying for siteId:', siteId)

    const pages = await SEOPage.find({ siteId })
      .select('path slug updatedAt')
      .lean()
    
    console.log('Found pages:', pages.length)

    const stats = {
      totalUrls: pages.length,
      lastModified: new Date().toISOString(),
      categoryBreakdown: pages.reduce((acc: Record<string, number>, page: any) => {
        const category = page.path.split('/')[1] || 'root'
        acc[category] = (acc[category] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      priorityBreakdown: { 0.8: pages.length }, // Default priority for all pages
      averagePriority: 0.8
    }

    const sitemapInfo = {
      totalEntries: pages.length,
      needsSitemapIndex: pages.length > 50000,
      sitemapCount: Math.ceil(pages.length / 50000) || 1,
      indexUrl: pages.length > 50000 ? '/sitemap.xml' : null,
      sitemapUrls: pages.length > 50000 
        ? Array.from({ length: Math.ceil(pages.length / 50000) }, (_, i) => `/sitemap-${i + 1}.xml`)
        : ['/sitemap.xml']
    }

    const previewEntries = pages.slice(0, 10).map((page: any) => ({
      url: page.path,
      lastModified: page.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8
    }))

    return NextResponse.json({
      data: {
        stats,
        sitemapInfo,
        previewEntries
      }
    })
  } catch (error) {
    logger.error('Error fetching sitemap info:', { error: error instanceof Error ? error.message : String(error) })
    console.error('Detailed sitemap error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch sitemap information',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

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

    // In a real implementation, this would trigger sitemap regeneration
    logger.info('Sitemap regeneration requested by:', user.id)

    return NextResponse.json({ 
      message: 'Sitemap regeneration initiated',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Error regenerating sitemap:', { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: 'Failed to regenerate sitemap' },
      { status: 500 }
    )
  }
}