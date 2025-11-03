import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/database/connection'
import SEOPage from '@/lib/models/SEOPage'
import { canAccessPage } from '@/lib/permissions'
import { logger } from '@/lib/logger'
import { PREDEFINED_PAGES } from '@/lib/data/predefined-pages'

// Performance monitoring cache
const performanceCache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

interface PagePerformanceMetrics {
  path: string
  title: string
  category: string
  loadTime: number
  seoScore: number
  issues: string[]
  lastChecked: Date
  status: 'healthy' | 'warning' | 'critical'
  metrics: {
    titleLength: number
    descriptionLength: number
    hasOpenGraph: boolean
    robotsDirective: string
    isIndexable: boolean
  }
}

async function analyzePagePerformance(page: any): Promise<PagePerformanceMetrics> {
  const predefinedPage = PREDEFINED_PAGES.find(p => p.path === page.path)
  const issues: string[] = []
  let seoScore = 100

  // Analyze SEO metrics
  if (!page.metaTitle || page.metaTitle.length === 0) {
    issues.push('Missing meta title')
    seoScore -= 20
  } else if (page.metaTitle.length > 60) {
    issues.push('Meta title too long (>60 characters)')
    seoScore -= 10
  } else if (page.metaTitle.length < 30) {
    issues.push('Meta title too short (<30 characters)')
    seoScore -= 5
  }

  if (!page.metaDescription || page.metaDescription.length === 0) {
    issues.push('Missing meta description')
    seoScore -= 15
  } else if (page.metaDescription.length > 160) {
    issues.push('Meta description too long (>160 characters)')
    seoScore -= 8
  } else if (page.metaDescription.length < 120) {
    issues.push('Meta description too short (<120 characters)')
    seoScore -= 3
  }

  if (!page.openGraph?.title && !page.metaTitle) {
    issues.push('Missing OpenGraph title')
    seoScore -= 5
  }

  if (!page.openGraph?.description && !page.metaDescription) {
    issues.push('Missing OpenGraph description')
    seoScore -= 5
  }

  if (!page.openGraph?.image) {
    issues.push('Missing OpenGraph image')
    seoScore -= 5
  }

  if (page.robots?.includes('noindex')) {
    issues.push('Page set to noindex')
    seoScore -= 10
  }

  // Determine status
  let status: 'healthy' | 'warning' | 'critical' = 'healthy'
  if (seoScore < 60) status = 'critical'
  else if (seoScore < 80) status = 'warning'

  // Simulate load time based on page complexity
  const loadTime = Math.random() * 2 + 0.5 + (issues.length * 0.1)

  return {
    path: page.path,
    title: page.metaTitle || predefinedPage?.defaultTitle || 'Untitled Page',
    category: predefinedPage?.category || 'other',
    loadTime,
    seoScore: Math.max(0, seoScore),
    issues,
    lastChecked: new Date(),
    status,
    metrics: {
      titleLength: page.metaTitle?.length || 0,
      descriptionLength: page.metaDescription?.length || 0,
      hasOpenGraph: !!(page.openGraph?.title || page.openGraph?.description || page.openGraph?.image),
      robotsDirective: page.robots || 'index,follow',
      isIndexable: !page.robots?.includes('noindex')
    }
  }
}

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

    const { searchParams } = new URL(request.url)
    const timeWindow = parseInt(searchParams.get('timeWindow') || '60') // minutes
    const siteId = searchParams.get('siteId') || 'altiorainfotech'
    const cacheKey = `performance-${siteId}-${timeWindow}`

    // Check cache
    const cached = performanceCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({ data: cached.data })
    }

    // Get all SEO pages
    const seoPages = await SEOPage.find({ siteId }).lean()
    
    // Get all predefined pages and merge with custom SEO data
    const allPages = PREDEFINED_PAGES.map(predefinedPage => {
      const customSEO = seoPages.find((seo: any) => seo.path === predefinedPage.path)
      return customSEO || {
        path: predefinedPage.path,
        metaTitle: predefinedPage.defaultTitle,
        metaDescription: predefinedPage.defaultDescription,
        robots: 'index,follow',
        openGraph: {},
        isCustom: false
      }
    })

    // Analyze performance for each page
    const pageAnalyses = await Promise.all(
      allPages.map(page => analyzePagePerformance(page))
    )

    // Calculate overall statistics
    const totalPages = pageAnalyses.length
    const healthyPages = pageAnalyses.filter(p => p.status === 'healthy').length
    const warningPages = pageAnalyses.filter(p => p.status === 'warning').length
    const criticalPages = pageAnalyses.filter(p => p.status === 'critical').length
    const avgLoadTime = pageAnalyses.reduce((sum, p) => sum + p.loadTime, 0) / totalPages
    const avgSeoScore = pageAnalyses.reduce((sum, p) => sum + p.seoScore, 0) / totalPages
    const indexablePages = pageAnalyses.filter(p => p.metrics.isIndexable).length

    // Get top issues
    const allIssues = pageAnalyses.flatMap(p => p.issues)
    const issueFrequency = allIssues.reduce((acc, issue) => {
      acc[issue] = (acc[issue] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const topIssues = Object.entries(issueFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([issue, count]) => ({ issue, count }))

    // Performance by category
    const categoryStats = pageAnalyses.reduce((acc, page) => {
      if (!acc[page.category]) {
        acc[page.category] = {
          count: 0,
          avgScore: 0,
          avgLoadTime: 0,
          issues: 0
        }
      }
      acc[page.category].count++
      acc[page.category].avgScore += page.seoScore
      acc[page.category].avgLoadTime += page.loadTime
      acc[page.category].issues += page.issues.length
      return acc
    }, {} as Record<string, any>)

    // Calculate averages for categories
    Object.keys(categoryStats).forEach(category => {
      const stats = categoryStats[category]
      stats.avgScore = stats.avgScore / stats.count
      stats.avgLoadTime = stats.avgLoadTime / stats.count
    })

    const performanceData = {
      timeWindow,
      generatedAt: new Date().toISOString(),
      overview: {
        totalPages,
        healthyPages,
        warningPages,
        criticalPages,
        avgLoadTime,
        avgSeoScore,
        indexablePages,
        customPages: seoPages.length
      },
      pages: pageAnalyses.sort((a, b) => {
        // Sort by status priority (critical first), then by score
        const statusPriority = { critical: 3, warning: 2, healthy: 1 }
        if (statusPriority[a.status] !== statusPriority[b.status]) {
          return statusPriority[b.status] - statusPriority[a.status]
        }
        return a.seoScore - b.seoScore
      }),
      topIssues,
      categoryStats,
      recommendations: generateRecommendations(pageAnalyses, topIssues),
      trends: {
        // Generate mock trend data - in production, this would come from historical data
        seoScores: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          score: Math.floor(avgSeoScore + (Math.random() - 0.5) * 10)
        })),
        loadTimes: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: avgLoadTime + (Math.random() - 0.5) * 0.5
        }))
      }
    }

    // Cache the results
    performanceCache.set(cacheKey, {
      data: performanceData,
      timestamp: Date.now()
    })

    return NextResponse.json({ data: performanceData })
  } catch (error) {
    logger.error('Error fetching performance stats:', { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: 'Failed to fetch performance statistics' },
      { status: 500 }
    )
  }
}

function generateRecommendations(pages: PagePerformanceMetrics[], topIssues: any[]): string[] {
  const recommendations: string[] = []
  
  const criticalPages = pages.filter(p => p.status === 'critical').length
  const warningPages = pages.filter(p => p.status === 'warning').length
  
  if (criticalPages > 0) {
    recommendations.push(`${criticalPages} pages have critical SEO issues that need immediate attention`)
  }
  
  if (warningPages > 0) {
    recommendations.push(`${warningPages} pages have SEO warnings that should be addressed`)
  }
  
  topIssues.forEach(({ issue, count }) => {
    if (count > 1) {
      recommendations.push(`${count} pages have "${issue}" - consider bulk fixing this issue`)
    }
  })
  
  const slowPages = pages.filter(p => p.loadTime > 2).length
  if (slowPages > 0) {
    recommendations.push(`${slowPages} pages have slow load times (>2s) - optimize for better performance`)
  }
  
  const noIndexPages = pages.filter(p => !p.metrics.isIndexable).length
  if (noIndexPages > 0) {
    recommendations.push(`${noIndexPages} pages are set to noindex - verify this is intentional`)
  }
  
  return recommendations
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

    const body = await request.json()
    const { action, siteId = 'altiorainfotech' } = body

    logger.info('Performance action requested:', { action, siteId, userId: user.id })

    switch (action) {
      case 'clear_cache':
        // Clear performance cache
        performanceCache.clear()
        logger.info('Performance cache cleared', { userId: user.id })
        return NextResponse.json({ 
          message: 'Performance cache cleared successfully',
          timestamp: new Date().toISOString()
        })

      case 'refresh_metrics':
        // Clear cache to force refresh on next request
        const cacheKeys = Array.from(performanceCache.keys()).filter(key => key.includes(siteId))
        cacheKeys.forEach(key => performanceCache.delete(key))
        logger.info('Performance metrics refreshed', { siteId, userId: user.id })
        return NextResponse.json({ 
          message: 'Performance metrics refreshed successfully',
          timestamp: new Date().toISOString()
        })

      case 'export_metrics':
        await connectToDatabase()
        
        // Get current performance data
        const seoPages = await SEOPage.find({ siteId }).lean()
        const allPages = PREDEFINED_PAGES.map(predefinedPage => {
          const customSEO = seoPages.find((seo: any) => seo.path === predefinedPage.path)
          return customSEO || {
            path: predefinedPage.path,
            metaTitle: predefinedPage.defaultTitle,
            metaDescription: predefinedPage.defaultDescription,
            robots: 'index,follow',
            openGraph: {},
            isCustom: false
          }
        })

        const pageAnalyses = await Promise.all(
          allPages.map(page => analyzePagePerformance(page))
        )

        const exportData = {
          exportedAt: new Date().toISOString(),
          siteId,
          totalPages: pageAnalyses.length,
          summary: {
            healthy: pageAnalyses.filter(p => p.status === 'healthy').length,
            warning: pageAnalyses.filter(p => p.status === 'warning').length,
            critical: pageAnalyses.filter(p => p.status === 'critical').length,
            avgSeoScore: pageAnalyses.reduce((sum, p) => sum + p.seoScore, 0) / pageAnalyses.length,
            avgLoadTime: pageAnalyses.reduce((sum, p) => sum + p.loadTime, 0) / pageAnalyses.length
          },
          pages: pageAnalyses
        }

        logger.info('Performance metrics exported', { siteId, pageCount: pageAnalyses.length, userId: user.id })
        return NextResponse.json({ 
          message: 'Performance metrics exported successfully',
          data: exportData,
          timestamp: new Date().toISOString()
        })

      case 'analyze_page':
        const { path } = body
        if (!path) {
          return NextResponse.json({ error: 'Page path is required' }, { status: 400 })
        }

        await connectToDatabase()
        const seoPage = await SEOPage.findOne({ path, siteId }).lean()
        const predefinedPage = PREDEFINED_PAGES.find(p => p.path === path)
        
        if (!predefinedPage) {
          return NextResponse.json({ error: 'Page not found' }, { status: 404 })
        }

        const pageData = seoPage || {
          path: predefinedPage.path,
          metaTitle: predefinedPage.defaultTitle,
          metaDescription: predefinedPage.defaultDescription,
          robots: 'index,follow',
          openGraph: {},
          isCustom: false
        }

        const analysis = await analyzePagePerformance(pageData)
        
        logger.info('Page analysis completed', { path, siteId, userId: user.id })
        return NextResponse.json({ 
          message: 'Page analysis completed successfully',
          data: analysis,
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Error executing performance action:', { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: 'Failed to execute performance action' },
      { status: 500 }
    )
  }
}