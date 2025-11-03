import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { canAccessPage } from '@/lib/permissions'
import { seoPageSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    console.log('=== DEBUG ENDPOINT ===')
    
    // Check session
    const session = await getServerSession(authOptions)
    console.log('Session:', session ? 'exists' : 'null')
    
    if (!session?.user) {
      console.log('No session or user')
      return NextResponse.json({ 
        error: 'Unauthorized',
        debug: { session: !!session, user: !!session?.user }
      }, { status: 401 })
    }

    const user = session.user as any
    console.log('User:', {
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    })

    // Check permissions
    const hasAccess = canAccessPage(user.permissions, user.role, 'seo')
    console.log('Has SEO access:', hasAccess)
    
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

    // Check request body
    const body = await request.json()
    console.log('Request body:', body)
    
    // Test validation
    const enrichedBody = {
      ...body,
      siteId: body.siteId || 'altiorainfotech',
      pageCategory: body.pageCategory || 'services',
      createdBy: user.id,
      updatedBy: user.id,
      isCustom: true
    }
    
    console.log('Enriched body:', enrichedBody)
    
    const validation = seoPageSchema.safeParse(enrichedBody)
    console.log('Validation result:', {
      success: validation.success,
      errors: validation.success ? null : validation.error?.issues
    })

    return NextResponse.json({
      success: true,
      debug: {
        session: !!session,
        user: {
          id: user.id,
          role: user.role,
          hasAccess
        },
        body,
        enrichedBody,
        validation: {
          success: validation.success,
          errors: validation.success ? null : validation.error?.issues
        }
      }
    })
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json(
      { 
        error: 'Debug endpoint failed',
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}