import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/database/connection'
import SEOPage from '@/lib/models/SEOPage'
import { canAccessPage } from '@/lib/permissions'
import { seoPageSchema } from '@/lib/validations'
import { logger } from '@/lib/logger'
import { createAuditLog, detectChanges } from '@/lib/utils/audit-logger'

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
    const siteId = searchParams.get('siteId') || 'altiorainfotech'

    const pages = await SEOPage.find({ siteId })
      .sort({ updatedAt: -1 })
      .lean()

    return NextResponse.json(pages)
  } catch (error) {
    logger.error('Error fetching SEO pages:', { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: 'Failed to fetch SEO pages' },
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
    logger.info('User from session:', { 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      permissions: user.permissions 
    })
    
    const hasAccess = canAccessPage(user.permissions, user.role, 'seo')
    logger.info('Access check result:', { 
      role: user.role, 
      hasAccess, 
      isAdmin: user.role === 'admin' 
    })
    
    if (!hasAccess) {
      return NextResponse.json({ 
        error: 'Forbidden', 
        debug: { 
          role: user.role, 
          permissions: user.permissions, 
          hasAccess 
        } 
      }, { status: 403 })
    }

    const body = await request.json()
    
    logger.info('Raw request body:', body)
    
    // Add required fields that might be missing from frontend
    const userId = String(user.id || user._id || 'system')
    
    // Clean up and validate path
    let cleanPath = body.path?.trim()
    if (cleanPath && !cleanPath.startsWith('/') && cleanPath !== 'home') {
      cleanPath = `/${cleanPath}`
    }
    
    // Clean up slug - ensure it's URL-friendly
    let cleanSlug = body.slug?.trim()?.toLowerCase()
    if (cleanSlug) {
      // Remove any non-alphanumeric characters except hyphens, then clean up multiple hyphens
      cleanSlug = cleanSlug
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
    }
    
    // Clean up openGraph - remove empty strings and convert to undefined if all empty
    const cleanOpenGraph = body.openGraph ? {
      title: body.openGraph.title?.trim() || undefined,
      description: body.openGraph.description?.trim() || undefined,
      image: body.openGraph.image?.trim() || undefined
    } : undefined
    
    // Only include openGraph if it has at least one non-empty field
    const hasOpenGraphData = cleanOpenGraph && (
      cleanOpenGraph.title || cleanOpenGraph.description || cleanOpenGraph.image
    )
    
    const enrichedBody = {
      ...body,
      path: cleanPath,
      slug: cleanSlug,
      siteId: body.siteId || 'altiorainfotech',
      pageCategory: body.pageCategory || 'other', // Default category
      createdBy: userId,
      updatedBy: userId,
      isCustom: true,
      // Clean up meta fields
      metaTitle: body.metaTitle?.trim(),
      metaDescription: body.metaDescription?.trim(),
      robots: body.robots || 'index,follow',
      ...(hasOpenGraphData ? { openGraph: cleanOpenGraph } : {})
    }
    
    logger.info('Enriched body for validation:', enrichedBody)

    const validation = seoPageSchema.safeParse(enrichedBody)

    if (!validation.success) {
      logger.error('Validation failed:', {
        errors: validation.error.issues,
        receivedData: enrichedBody
      })
      
      // Format validation errors for better debugging
      const formattedErrors = validation.error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        received: err.path.reduce((obj, key) => obj?.[key], enrichedBody)
      }))
      
      return NextResponse.json(
        { 
          error: 'Invalid data', 
          details: formattedErrors,
          received: body,
          enriched: enrichedBody
        },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const seoData = validation.data

    // Check if this is an update or create operation
    const existingPage = await SEOPage.findOne({ 
      siteId: seoData.siteId, 
      path: seoData.path 
    }).lean()

    // Upsert the SEO page
    const result = await SEOPage.findOneAndUpdate(
      { siteId: seoData.siteId, path: seoData.path },
      seoData,
      { upsert: true, new: true }
    )

    // Create audit log
    const isUpdate = !!existingPage
    const action = isUpdate ? 'update' : 'create'
    
    // Fields to track for changes
    const fieldsToTrack = [
      'metaTitle',
      'metaDescription', 
      'slug',
      'robots',
      'openGraph.title',
      'openGraph.description',
      'openGraph.image'
    ]
    
    const changes = isUpdate 
      ? detectChanges(existingPage, seoData, fieldsToTrack)
      : fieldsToTrack.map(field => ({
          field,
          oldValue: null,
          newValue: getNestedValue(seoData, field)
        })).filter(change => change.newValue !== null && change.newValue !== undefined)

    // Only create audit log if there are actual changes or it's a new page
    if (changes.length > 0) {
      await createAuditLog({
        siteId: seoData.siteId,
        action,
        entityType: 'seo_page',
        entityId: result._id.toString(),
        path: seoData.path,
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

    logger.info('SEO page saved:', { 
      path: seoData.path, 
      userId: user.id, 
      action,
      changesCount: changes.length 
    })

    // Trigger revalidation on the main website
    try {
      const altioraUrl = process.env.ALTIORA_SITE_URL || 'http://localhost:3000'
      const revalidationSecret = process.env.REVALIDATION_SECRET || 'seo-revalidation-secret-key-2024'
      
      const revalidateResponse = await fetch(`${altioraUrl}/api/revalidate-seo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: seoData.path,
          secret: revalidationSecret
        })
      })

      if (revalidateResponse.ok) {
        logger.info('Successfully triggered revalidation for path:', { path: seoData.path })
      } else {
        const errorText = await revalidateResponse.text()
        logger.warn('Failed to trigger revalidation:', { error: errorText })
      }
    } catch (revalidationError) {
      logger.warn('Error triggering revalidation:', { 
        error: revalidationError instanceof Error ? revalidationError.message : String(revalidationError) 
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    logger.error('Error saving SEO page:', { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: 'Failed to save SEO page', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}