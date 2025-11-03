import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/database/connection'
import { canAccessPage } from '@/lib/permissions'
import { logger } from '@/lib/logger'
import SEOAuditLog from '@/lib/models/SEOAuditLog'
import AdminUser from '@/lib/models/AdminUser'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    const user = session.user as any
    if (!canAccessPage(user.permissions, user.role, 'seo')) {
      return NextResponse.json({ 
        success: false,
        error: 'Forbidden' 
      }, { status: 403 })
    }

    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100) // Cap at 100
    const siteId = searchParams.get('siteId') || 'altiorainfotech'
    const action = searchParams.get('action')
    const entityType = searchParams.get('entityType')
    const path = searchParams.get('path')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // Build query
    const query: any = { siteId }
    
    if (action) query.action = action
    if (entityType) query.entityType = entityType
    if (path) query.path = { $regex: path, $options: 'i' }
    
    if (dateFrom || dateTo) {
      query.performedAt = {}
      if (dateFrom) query.performedAt.$gte = new Date(dateFrom)
      if (dateTo) {
        const endDate = new Date(dateTo)
        endDate.setHours(23, 59, 59, 999) // End of day
        query.performedAt.$lte = endDate
      }
    }

    // Get total count
    const total = await SEOAuditLog.countDocuments(query)
    const totalPages = Math.ceil(total / limit)
    const skip = (page - 1) * limit

    // Fetch audit logs with user information
    const logs = await SEOAuditLog.find(query)
      .populate('performedBy', 'email role')
      .sort({ performedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const auditLogs = {
      logs: logs.map(log => ({
        ...log,
        performedBy: {
          _id: log.performedBy._id,
          email: log.performedBy.email || 'Unknown User',
          role: log.performedBy.role || 'unknown'
        }
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }

    return NextResponse.json({
      success: true,
      data: auditLogs
    })
  } catch (error) {
    logger.error('Error fetching audit logs:', { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch audit logs' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    const user = session.user as any
    if (!canAccessPage(user.permissions, user.role, 'seo')) {
      return NextResponse.json({ 
        success: false,
        error: 'Forbidden' 
      }, { status: 403 })
    }

    await connectToDatabase()

    const body = await request.json()
    const days = body.days || 30
    const siteId = body.siteId || 'altiorainfotech'

    const dateFrom = new Date()
    dateFrom.setDate(dateFrom.getDate() - days)

    // Get stats for the specified period
    const [totalChanges, uniquePagesModified, actionBreakdown, topUsers] = await Promise.all([
      // Total changes
      SEOAuditLog.countDocuments({
        siteId,
        performedAt: { $gte: dateFrom }
      }),

      // Unique pages modified
      SEOAuditLog.distinct('path', {
        siteId,
        performedAt: { $gte: dateFrom },
        path: { $exists: true, $ne: null }
      }).then(paths => paths.length),

      // Action breakdown
      SEOAuditLog.aggregate([
        {
          $match: {
            siteId,
            performedAt: { $gte: dateFrom }
          }
        },
        {
          $group: {
            _id: '$action',
            count: { $sum: 1 }
          }
        }
      ]).then(results => 
        results.reduce((acc, item) => {
          acc[item._id] = item.count
          return acc
        }, {} as Record<string, number>)
      ),

      // Top users
      SEOAuditLog.aggregate([
        {
          $match: {
            siteId,
            performedAt: { $gte: dateFrom }
          }
        },
        {
          $group: {
            _id: '$performedBy',
            changeCount: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'adminusers',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $project: {
            userId: '$_id',
            email: '$user.email',
            changeCount: 1
          }
        },
        {
          $sort: { changeCount: -1 }
        },
        {
          $limit: 5
        }
      ])
    ])

    const stats = {
      totalChanges,
      uniquePagesModified,
      actionBreakdown,
      topUsers
    }

    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    logger.error('Error fetching audit stats:', { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch audit stats' 
      },
      { status: 500 }
    )
  }
}