import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/database/connection'
import SEOPage from '@/lib/models/SEOPage'
import { logger } from '@/lib/logger'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string }> }
) {
  try {
    await connectToDatabase()

    const { path: pathParam } = await params
    const path = decodeURIComponent(pathParam)
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId') || 'altiorainfotech'

    // Find SEO data for the specific path
    const seoPage = await SEOPage.findOne({ siteId, path }).lean()

    if (!seoPage) {
      return NextResponse.json({ error: 'SEO page not found' }, { status: 404 })
    }

    // Return only the necessary SEO data (exclude sensitive fields)
    const publicSEOData = {
      path: seoPage.path,
      slug: seoPage.slug,
      metaTitle: seoPage.metaTitle,
      metaDescription: seoPage.metaDescription,
      robots: seoPage.robots,
      openGraph: seoPage.openGraph,
      updatedAt: seoPage.updatedAt
    }

    return NextResponse.json(publicSEOData, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    logger.error('Error fetching public SEO data:', { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: 'Failed to fetch SEO data' },
      { status: 500 }
    )
  }
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}