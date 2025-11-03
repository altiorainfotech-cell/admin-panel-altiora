import { connectToDatabase } from '@/lib/database/connection'
import SEOAuditLog, { ISEOAuditLog } from '@/lib/models/SEOAuditLog'
import { logger } from '@/lib/logger'

interface AuditLogData {
  siteId: string
  action: ISEOAuditLog['action']
  entityType: ISEOAuditLog['entityType']
  entityId?: string
  path?: string
  oldSlug?: string
  newSlug?: string
  changes: {
    field: string
    oldValue: any
    newValue: any
  }[]
  metadata?: {
    userAgent?: string
    ipAddress?: string
    bulkOperation?: boolean
    affectedPaths?: string[]
    redirectCreated?: boolean
  }
  performedBy: string
}

export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    await connectToDatabase()
    
    const auditLog = new SEOAuditLog({
      ...data,
      performedAt: new Date()
    })
    
    await auditLog.save()
    
    logger.info('Audit log created:', {
      action: data.action,
      entityType: data.entityType,
      path: data.path,
      performedBy: data.performedBy
    })
  } catch (error) {
    logger.error('Failed to create audit log:', {
      error: error instanceof Error ? error.message : String(error),
      data
    })
    // Don't throw error to avoid breaking the main operation
  }
}

export function detectChanges(oldData: any, newData: any, fieldsToTrack: string[]): Array<{field: string, oldValue: any, newValue: any}> {
  const changes: Array<{field: string, oldValue: any, newValue: any}> = []
  
  for (const field of fieldsToTrack) {
    const oldValue = getNestedValue(oldData, field)
    const newValue = getNestedValue(newData, field)
    
    // Compare values, handling different types
    if (!isEqual(oldValue, newValue)) {
      changes.push({
        field,
        oldValue: oldValue === undefined ? null : oldValue,
        newValue: newValue === undefined ? null : newValue
      })
    }
  }
  
  return changes
}

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

function isEqual(a: any, b: any): boolean {
  // Handle null/undefined
  if (a === null || a === undefined) return b === null || b === undefined
  if (b === null || b === undefined) return false
  
  // Handle primitives
  if (typeof a !== 'object' || typeof b !== 'object') {
    return a === b
  }
  
  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((item, index) => isEqual(item, b[index]))
  }
  
  if (Array.isArray(a) || Array.isArray(b)) return false
  
  // Handle objects
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  
  if (keysA.length !== keysB.length) return false
  
  return keysA.every(key => isEqual(a[key], b[key]))
}