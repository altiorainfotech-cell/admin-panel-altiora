'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { hasPermission } from '@/lib/permissions'
import { IPermissions } from '@/lib/models/AdminUser'
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Loader2, 
  Plus, 
  Trash2,
  Upload,
  Layers
} from 'lucide-react'

interface Web3ServiceData {
  _id?: string
  serviceType: string
  heroSection: {
    title: string
    subtitle: string
    description: string
    backgroundImage: string
    ctaText: string
    ctaLink: string
  }
  whatIsSection: {
    title: string
    subtitle: string
    description: string
    additionalDescription?: string
    icon: string
  }
  whyMattersSection?: {
    title: string
    subtitle: string
    technicalAdvantages: string[]
    businessBenefits: string[]
  }
  whyChoosePoints: Array<{
    text: string
    icon: string
  }>
  services: Array<{
    name: string
    description?: string
    image: string
    link: string
  }>
  processSteps: Array<{
    step: number
    title: string
    description: string
    icon: string
  }>
  whyWorkWithUs: Array<{
    text: string
    icon: string
    title: string
    subtitle: string
  }>
  ctaSection: {
    title: string
    description: string
    additionalDescription?: string
    backgroundImage: string
    primaryCTA: {
      text: string
      link: string
    }
    secondaryCTA: {
      text: string
      link: string
    }
  }
  seoMetadata: {
    title: string
    description: string
  }
}

const defaultServiceData: Web3ServiceData = {
  serviceType: '',
  heroSection: {
    title: '',
    subtitle: '',
    description: '',
    backgroundImage: '',
    ctaText: 'Get Started',
    ctaLink: '/contact'
  },
  whatIsSection: {
    title: '',
    subtitle: '',
    description: '',
    additionalDescription: '',
    icon: ''
  },
  whyChoosePoints: [],
  services: [],
  processSteps: [],
  whyWorkWithUs: [],
  ctaSection: {
    title: '',
    description: '',
    additionalDescription: '',
    backgroundImage: '',
    primaryCTA: {
      text: 'Get Started',
      link: '/contact'
    },
    secondaryCTA: {
      text: 'Learn More',
      link: '/about'
    }
  },
  seoMetadata: {
    title: '',
    description: ''
  }
}

export default function Web3ServiceEditor() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [serviceData, setServiceData] = useState<Web3ServiceData>(defaultServiceData)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const serviceType = params.serviceType as string

  // Get user permissions
  const user = session?.user as any
  const userRole = user?.role as 'admin' | 'seo' | 'custom'
  const userPermissions = user?.permissions as IPermissions | undefined

  const canRead = hasPermission(userPermissions, userRole, 'services', 'read')
  const canWrite = hasPermission(userPermissions, userRole, 'services', 'write')

  // Fetch service data
  useEffect(() => {
    const fetchServiceData = async () => {
      if (!serviceType || serviceType === 'new' || serviceType === 'new-service') {
        setServiceData({ ...defaultServiceData, serviceType: '' })
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/admin/services/web3/${serviceType}`)
        if (response.ok) {
          const data = await response.json()
          setServiceData(data.service)
        } else if (response.status === 404) {
          setServiceData({ ...defaultServiceData, serviceType })
        } else {
          throw new Error('Failed to fetch service data')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch service data')
      } finally {
        setLoading(false)
      }
    }

    if (canRead) {
      fetchServiceData()
    }
  }, [serviceType, canRead])

  const handleSave = async () => {
    if (!canWrite) return

    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/services/web3/${serviceType}`, {
        method: serviceData._id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(serviceData)
      })

      if (!response.ok) {
        throw new Error('Failed to save service')
      }

      const result = await response.json()
      setServiceData(result.service)
      
      // Show success message or redirect
      router.push('/admin/services')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save service')
    } finally {
      setSaving(false)
    }
  }

  if (!canRead) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <Layers className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access services management.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
          <span className="text-gray-600">Loading service data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {(serviceType === 'new' || serviceType === 'new-service') ? 'Create New Web3 Service' : `Edit ${serviceType}`}
              </h1>
              <p className="text-gray-600 mt-1">Web3 Services Management</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {canWrite && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Type
                </label>
                <input
                  type="text"
                  value={serviceData.serviceType}
                  onChange={(e) => setServiceData(prev => ({ ...prev, serviceType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., blockchain, dao, defi"
                  disabled={!canWrite}
                />
              </div>
            </div>
          </div>

          {/* Hero Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Hero Section</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={serviceData.heroSection.title}
                  onChange={(e) => setServiceData(prev => ({
                    ...prev,
                    heroSection: { ...prev.heroSection, title: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!canWrite}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                <input
                  type="text"
                  value={serviceData.heroSection.subtitle}
                  onChange={(e) => setServiceData(prev => ({
                    ...prev,
                    heroSection: { ...prev.heroSection, subtitle: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!canWrite}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={serviceData.heroSection.description}
                  onChange={(e) => setServiceData(prev => ({
                    ...prev,
                    heroSection: { ...prev.heroSection, description: e.target.value }
                  }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!canWrite}
                />
              </div>
            </div>
          </div>

          {/* What Is Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">What Is Section</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={serviceData.whatIsSection.title}
                  onChange={(e) => setServiceData(prev => ({
                    ...prev,
                    whatIsSection: { ...prev.whatIsSection, title: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!canWrite}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                <input
                  type="text"
                  value={serviceData.whatIsSection.subtitle}
                  onChange={(e) => setServiceData(prev => ({
                    ...prev,
                    whatIsSection: { ...prev.whatIsSection, subtitle: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!canWrite}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={serviceData.whatIsSection.description}
                  onChange={(e) => setServiceData(prev => ({
                    ...prev,
                    whatIsSection: { ...prev.whatIsSection, description: e.target.value }
                  }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!canWrite}
                />
              </div>
            </div>
          </div>

          {/* SEO Metadata */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO Metadata</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SEO Title</label>
                <input
                  type="text"
                  value={serviceData.seoMetadata.title}
                  onChange={(e) => setServiceData(prev => ({
                    ...prev,
                    seoMetadata: { ...prev.seoMetadata, title: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!canWrite}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SEO Description</label>
                <textarea
                  value={serviceData.seoMetadata.description}
                  onChange={(e) => setServiceData(prev => ({
                    ...prev,
                    seoMetadata: { ...prev.seoMetadata, description: e.target.value }
                  }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!canWrite}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}