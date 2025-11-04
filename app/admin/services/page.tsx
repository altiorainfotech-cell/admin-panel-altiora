'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { hasPermission } from '@/lib/permissions'
import { IPermissions } from '@/lib/models/AdminUser'
import { 
  Edit, 
  Layers, 
  Globe, 
  Bot, 
  Code,
  Loader2
} from 'lucide-react'

interface ServiceCategory {
  id: string
  name: string
  icon: React.ReactNode
  description: string
}

interface ServicePage {
  _id: string
  serviceType: string
  heroSection: {
    title: string
    subtitle: string
  }
  seoMetadata: {
    title: string
    description: string
  }
  updatedAt: string
}

const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'web2',
    name: 'Web2 Services',
    icon: <Globe className="w-5 h-5" />,
    description: 'Traditional web development services'
  },
  {
    id: 'web3',
    name: 'Web3 Services', 
    icon: <Layers className="w-5 h-5" />,
    description: 'Blockchain and decentralized services'
  },
  {
    id: 'ai-ml',
    name: 'AI/ML Services',
    icon: <Bot className="w-5 h-5" />,
    description: 'Artificial Intelligence and Machine Learning services'
  }
]

export default function ServicesPage() {
  const { data: session } = useSession()
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  const [services, setServices] = useState<ServicePage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get user permissions
  const user = session?.user as any
  const userRole = user?.role as 'admin' | 'seo' | 'custom'
  const userPermissions = user?.permissions as IPermissions | undefined

  const canRead = hasPermission(userPermissions, userRole, 'services', 'read')
  const canWrite = hasPermission(userPermissions, userRole, 'services', 'write')

  // Fetch services for selected category
  const fetchServices = async (category: string) => {
    if (!category) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/admin/services/${category}`)
      if (!response.ok) {
        throw new Error('Failed to fetch services')
      }
      
      const data = await response.json()
      setServices(data.services || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch services')
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedCategory) {
      fetchServices(selectedCategory)

    }
  }, [selectedCategory])

  if (!canRead) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-900/20 rounded-full flex items-center justify-center">
            <Code className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-300">You don't have permission to access services management.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Services Management</h1>
          <p className="text-slate-300">
            Manage content for Web2, Web3, and AI/ML service pages
          </p>
        </div>

        {/* Category Selection */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg shadow-lg border border-slate-700/50 mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Select Service Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SERVICE_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    selectedCategory === category.id
                      ? 'border-blue-400 bg-blue-900/30 backdrop-blur-sm'
                      : 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/30'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <div className="text-blue-400">
                      {category.icon}
                    </div>
                    <span className="ml-2 font-medium text-white">{category.name}</span>
                  </div>
                  <p className="text-sm text-slate-300">{category.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Service Pages List */}
        {selectedCategory && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg shadow-lg border border-slate-700/50">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">
                  {SERVICE_CATEGORIES.find(c => c.id === selectedCategory)?.name} Pages
                </h2>
                {canWrite && (
                  <button
                    onClick={() => window.location.href = `/admin/services/${selectedCategory}/new`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                  >
                    Add New Page
                  </button>
                )}
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                  <span className="ml-2 text-slate-300">Loading services...</span>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-900/20 rounded-full flex items-center justify-center">
                    <Code className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">Error Loading Services</h3>
                  <p className="text-slate-300 mb-4">{error}</p>
                  <button
                    onClick={() => fetchServices(selectedCategory)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                  >
                    Try Again
                  </button>
                </div>
              ) : services.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-700/30 rounded-full flex items-center justify-center">
                    <Layers className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">No Services Found</h3>
                  <p className="text-slate-300 mb-4">
                    No service pages found for {SERVICE_CATEGORIES.find(c => c.id === selectedCategory)?.name}.
                  </p>
                  {canWrite && (
                    <button
                      onClick={() => window.location.href = `/admin/services/${selectedCategory}/new`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                    >
                      Create First Page
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {services.map((service) => (
                    <div
                      key={service._id}
                      className="border border-slate-600/50 bg-slate-700/20 rounded-lg p-4 hover:bg-slate-700/40 transition-colors backdrop-blur-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-white mb-1">
                            {service.heroSection.title}
                          </h3>
                          <p className="text-sm text-slate-300 mb-2">
                            {service.heroSection.subtitle}
                          </p>
                          <div className="flex items-center text-xs text-slate-400">
                            <span>Service Type: {service.serviceType}</span>
                            <span className="mx-2">•</span>
                            <span>Updated: {new Date(service.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => window.location.href = `/admin/services/${selectedCategory}/${service.serviceType}`}
                            className="p-2 text-slate-400 hover:text-blue-400 transition-colors rounded-lg hover:bg-slate-600/30"
                            title="View/Edit Service"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}