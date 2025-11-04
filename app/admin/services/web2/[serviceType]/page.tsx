'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { hasPermission } from '@/lib/permissions'
import { IPermissions } from '@/lib/models/AdminUser'
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Plus, 
  Trash2,
  Globe,
  ChevronDown,
  ChevronUp,
  Settings,
  Type,
  List,
  Target,
  Users,
  Zap,
  X
} from 'lucide-react'
import ImageUpload from '@/app/admin/components/ImageUpload'

interface Web2ServiceData {
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
  whyChoosePoints: Array<{
    text: string
  }>
  services: Array<{
    title: string
    description: string
    icon: string
    link: string
  }>
  mobileServices: Array<{
    title: string
    description: string
    icon: string
    link: string
  }>
  dnaAnimation: {
    title: string
    description: string
    data: Array<{
      title: string
      text: string
    }>
  }
  whyWorkWithUs: Array<{
    title: string
    description: string
    icon: string
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
  updatedAt?: string
}

const defaultServiceData: Web2ServiceData = {
  serviceType: '',
  heroSection: {
    title: '',
    subtitle: '',
    description: '',
    backgroundImage: '',
    ctaText: 'Get Started',
    ctaLink: '/contact'
  },
  whyChoosePoints: [],
  services: [],
  mobileServices: [],
  dnaAnimation: {
    title: '',
    description: '',
    data: []
  },
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

export default function Web2ServiceEditor() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [serviceData, setServiceData] = useState<Web2ServiceData>(defaultServiceData)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    hero: true,
    whyChoose: false,
    services: false,
    mobileServices: false,
    dnaAnimation: false,
    whyWorkWithUs: false,
    cta: false,
    seo: false
  })

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
        const response = await fetch(`/api/admin/services/web2/${serviceType}`)
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
      const response = await fetch(`/api/admin/services/web2/${serviceType}`, {
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
      
      // Show success message
      setSuccessMessage('Service saved successfully!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save service')
    } finally {
      setSaving(false)
    }
  }

  const addWhyChoosePoint = () => {
    setServiceData(prev => ({
      ...prev,
      whyChoosePoints: [...prev.whyChoosePoints, { text: '' }]
    }))
  }

  const removeWhyChoosePoint = (index: number) => {
    setServiceData(prev => ({
      ...prev,
      whyChoosePoints: prev.whyChoosePoints.filter((_, i) => i !== index)
    }))
  }

  const addService = () => {
    setServiceData(prev => ({
      ...prev,
      services: [...prev.services, { title: '', description: '', icon: '', link: '/contact' }]
    }))
  }

  const removeService = (index: number) => {
    setServiceData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }))
  }

  const addWhyWorkWithUs = () => {
    setServiceData(prev => ({
      ...prev,
      whyWorkWithUs: [...prev.whyWorkWithUs, { title: '', description: '', icon: '' }]
    }))
  }

  const removeWhyWorkWithUs = (index: number) => {
    setServiceData(prev => ({
      ...prev,
      whyWorkWithUs: prev.whyWorkWithUs.filter((_, i) => i !== index)
    }))
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const formatServiceTitle = (serviceType: string) => {
    return serviceType
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const SectionHeader = ({ 
    title, 
    icon: Icon, 
    section, 
    description 
  }: { 
    title: string
    icon: any
    section: string
    description?: string 
  }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-slate-700/50 to-slate-600/50 hover:from-slate-600/50 hover:to-slate-500/50 transition-all duration-200 rounded-t-lg border-b border-slate-600/50"
    >
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-slate-700/50 rounded-lg shadow-sm">
          {Icon && <Icon className="w-5 h-5 text-blue-400" />}
        </div>
        <div className="text-left">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          {description && (
            <p className="text-sm text-slate-300">{description}</p>
          )}
        </div>
      </div>
      {expandedSections[section] ? (
        <ChevronUp className="w-5 h-5 text-slate-400" />
      ) : (
        <ChevronDown className="w-5 h-5 text-slate-400" />
      )}
    </button>
  )

  if (!canRead) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <Globe className="w-8 h-8 text-red-600" />
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white admin-panel-theme">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl shadow-lg border border-slate-700/50 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Globe className="w-6 h-6 text-blue-600" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {(serviceType === 'new' || serviceType === 'new-service') 
                      ? 'Create New Web2 Service' 
                      : `Edit ${formatServiceTitle(serviceType)}`
                    }
                  </h1>
                </div>
                <p className="text-gray-600">Web2 Services Management • Configure all aspects of your service page</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right mr-4">
                <p className="text-sm text-gray-500">Last saved</p>
                <p className="text-sm font-medium text-gray-700">
                  {serviceData.updatedAt ? new Date(serviceData.updatedAt).toLocaleString() : 'Never'}
                </p>
              </div>
              {canWrite && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-lg transition-all duration-200"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Save className="w-5 h-5 mr-2" />
                  )}
                  {saving ? 'Saving Changes...' : 'Save Changes'}
                </button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-center backdrop-blur-sm">
            <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center mr-3">
              <X className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-red-300 font-medium">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-500/50 rounded-lg flex items-center backdrop-blur-sm">
            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mr-3">
              <Save className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-green-300 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Form */}
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg shadow-lg border border-slate-700/50 overflow-hidden">
            <SectionHeader 
              title="Basic Information" 
              icon={Settings}
              section="basic"
              description="Configure the fundamental service details"
            />
            {expandedSections.basic && (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Service Type
                    </label>
                    <input
                      type="text"
                      value={serviceData.serviceType}
                      onChange={(e) => setServiceData(prev => ({ ...prev, serviceType: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors text-white placeholder-slate-400"
                      placeholder="e.g., api-development-integration"
                      disabled={!canWrite}
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Use lowercase with hyphens (kebab-case)
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Hero Section */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg shadow-lg border border-slate-700/50 overflow-hidden">
            <SectionHeader 
              title="Hero Section" 
              icon={Type}
              section="hero"
              description="Main banner content and call-to-action"
            />
            {expandedSections.hero && (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Title</label>
                      <input
                        type="text"
                        value={serviceData.heroSection.title}
                        onChange={(e) => setServiceData(prev => ({
                          ...prev,
                          heroSection: { ...prev.heroSection, title: e.target.value }
                        }))}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors text-white placeholder-slate-400"
                        placeholder="Enter compelling hero title"
                        disabled={!canWrite}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Subtitle</label>
                      <input
                        type="text"
                        value={serviceData.heroSection.subtitle}
                        onChange={(e) => setServiceData(prev => ({
                          ...prev,
                          heroSection: { ...prev.heroSection, subtitle: e.target.value }
                        }))}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors text-white placeholder-slate-400"
                        placeholder="Supporting subtitle text"
                        disabled={!canWrite}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Description</label>
                      <textarea
                        value={serviceData.heroSection.description}
                        onChange={(e) => setServiceData(prev => ({
                          ...prev,
                          heroSection: { ...prev.heroSection, description: e.target.value }
                        }))}
                        rows={4}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors resize-none text-white placeholder-slate-400"
                        placeholder="Detailed description of the service"
                        disabled={!canWrite}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">CTA Button Text</label>
                        <input
                          type="text"
                          value={serviceData.heroSection.ctaText}
                          onChange={(e) => setServiceData(prev => ({
                            ...prev,
                            heroSection: { ...prev.heroSection, ctaText: e.target.value }
                          }))}
                          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors text-white placeholder-slate-400"
                          placeholder="Get Started"
                          disabled={!canWrite}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">CTA Button Link</label>
                        <input
                          type="text"
                          value={serviceData.heroSection.ctaLink}
                          onChange={(e) => setServiceData(prev => ({
                            ...prev,
                            heroSection: { ...prev.heroSection, ctaLink: e.target.value }
                          }))}
                          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors text-white placeholder-slate-400"
                          placeholder="/contact"
                          disabled={!canWrite}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <ImageUpload
                      currentImage={serviceData.heroSection.backgroundImage}
                      onImageChange={(imageUrl) => setServiceData(prev => ({
                        ...prev,
                        heroSection: { ...prev.heroSection, backgroundImage: imageUrl }
                      }))}
                      label="Background Image"
                      disabled={!canWrite}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Why Choose Points */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg shadow-lg border border-slate-700/50 overflow-hidden">
            <SectionHeader 
              title="Why Choose Points" 
              icon={Target}
              section="whyChoose"
              description="Key reasons customers should choose this service"
            />
            {expandedSections.whyChoose && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-gray-600">
                      Add compelling reasons why customers should choose this service
                    </p>
                  </div>
                  {canWrite && (
                    <button
                      onClick={addWhyChoosePoint}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Point
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {serviceData.whyChoosePoints.map((point, index) => (
                    <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                      </div>
                      <input
                        type="text"
                        value={point.text}
                        onChange={(e) => {
                          const newPoints = [...serviceData.whyChoosePoints]
                          newPoints[index].text = e.target.value
                          setServiceData(prev => ({ ...prev, whyChoosePoints: newPoints }))
                        }}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter why choose point"
                        disabled={!canWrite}
                      />
                      {canWrite && (
                        <button
                          onClick={() => removeWhyChoosePoint(index)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {serviceData.whyChoosePoints.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">No why choose points added yet</p>
                      <p className="text-gray-400 text-sm">Click "Add Point" to get started</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Services */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <SectionHeader 
              title="Services" 
              icon={List}
              section="services"
              description="Main services offered in this category"
            />
            {expandedSections.services && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-gray-600">
                      Configure the main services offered in this category
                    </p>
                  </div>
                  {canWrite && (
                    <button
                      onClick={addService}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Service
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  {serviceData.services.map((service, index) => (
                    <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{index + 1}</span>
                          </div>
                          <h3 className="font-semibold text-gray-900">Service {index + 1}</h3>
                        </div>
                        {canWrite && (
                          <button
                            onClick={() => removeService(index)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                          <input
                            type="text"
                            value={service.title}
                            onChange={(e) => {
                              const newServices = [...serviceData.services]
                              newServices[index].title = e.target.value
                              setServiceData(prev => ({ ...prev, services: newServices }))
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                            placeholder="Service title"
                            disabled={!canWrite}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                          <input
                            type="text"
                            value={service.icon}
                            onChange={(e) => {
                              const newServices = [...serviceData.services]
                              newServices[index].icon = e.target.value
                              setServiceData(prev => ({ ...prev, services: newServices }))
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                            placeholder="Icon class or URL"
                            disabled={!canWrite}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                          <textarea
                            value={service.description}
                            onChange={(e) => {
                              const newServices = [...serviceData.services]
                              newServices[index].description = e.target.value
                              setServiceData(prev => ({ ...prev, services: newServices }))
                            }}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none bg-white"
                            placeholder="Detailed service description"
                            disabled={!canWrite}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Link</label>
                          <input
                            type="text"
                            value={service.link}
                            onChange={(e) => {
                              const newServices = [...serviceData.services]
                              newServices[index].link = e.target.value
                              setServiceData(prev => ({ ...prev, services: newServices }))
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                            placeholder="/contact"
                            disabled={!canWrite}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {serviceData.services.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <List className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">No services added yet</p>
                      <p className="text-gray-400 text-sm">Click "Add Service" to get started</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Services */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <SectionHeader 
              title="Mobile Services" 
              icon={List}
              section="mobileServices"
              description="Mobile-specific services and features"
            />
            {expandedSections.mobileServices && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-gray-600">
                      Configure mobile-specific services and features
                    </p>
                  </div>
                  {canWrite && (
                    <button
                      onClick={() => setServiceData(prev => ({
                        ...prev,
                        mobileServices: [...prev.mobileServices, { title: '', description: '', icon: '', link: '/contact' }]
                      }))}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Mobile Service
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  {serviceData.mobileServices.map((service, index) => (
                    <div key={index} className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{index + 1}</span>
                          </div>
                          <h3 className="font-semibold text-gray-900">Mobile Service {index + 1}</h3>
                        </div>
                        {canWrite && (
                          <button
                            onClick={() => setServiceData(prev => ({
                              ...prev,
                              mobileServices: prev.mobileServices.filter((_, i) => i !== index)
                            }))}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                          <input
                            type="text"
                            value={service.title}
                            onChange={(e) => {
                              const newServices = [...serviceData.mobileServices]
                              newServices[index].title = e.target.value
                              setServiceData(prev => ({ ...prev, mobileServices: newServices }))
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                            placeholder="Mobile service title"
                            disabled={!canWrite}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                          <input
                            type="text"
                            value={service.icon}
                            onChange={(e) => {
                              const newServices = [...serviceData.mobileServices]
                              newServices[index].icon = e.target.value
                              setServiceData(prev => ({ ...prev, mobileServices: newServices }))
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                            placeholder="Icon class or URL"
                            disabled={!canWrite}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                          <textarea
                            value={service.description}
                            onChange={(e) => {
                              const newServices = [...serviceData.mobileServices]
                              newServices[index].description = e.target.value
                              setServiceData(prev => ({ ...prev, mobileServices: newServices }))
                            }}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none bg-white"
                            placeholder="Mobile service description"
                            disabled={!canWrite}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Link</label>
                          <input
                            type="text"
                            value={service.link}
                            onChange={(e) => {
                              const newServices = [...serviceData.mobileServices]
                              newServices[index].link = e.target.value
                              setServiceData(prev => ({ ...prev, mobileServices: newServices }))
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                            placeholder="/contact"
                            disabled={!canWrite}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {serviceData.mobileServices.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <List className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">No mobile services added yet</p>
                      <p className="text-gray-400 text-sm">Click "Add Mobile Service" to get started</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* DNA Animation */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <SectionHeader 
              title="DNA Animation Section" 
              icon={Zap}
              section="dnaAnimation"
              description="Interactive animation content and data points"
            />
            {expandedSections.dnaAnimation && (
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={serviceData.dnaAnimation.title}
                    onChange={(e) => setServiceData(prev => ({
                      ...prev,
                      dnaAnimation: { ...prev.dnaAnimation, title: e.target.value }
                    }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    disabled={!canWrite}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={serviceData.dnaAnimation.description}
                    onChange={(e) => setServiceData(prev => ({
                      ...prev,
                      dnaAnimation: { ...prev.dnaAnimation, description: e.target.value }
                    }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    disabled={!canWrite}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">Animation Data Points</label>
                    {canWrite && (
                      <button
                        onClick={() => setServiceData(prev => ({
                          ...prev,
                          dnaAnimation: {
                            ...prev.dnaAnimation,
                            data: [...prev.dnaAnimation.data, { title: '', text: '' }]
                          }
                        }))}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Data Point
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {serviceData.dnaAnimation.data.map((dataPoint, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Data Point {index + 1}</span>
                          {canWrite && (
                            <button
                              onClick={() => setServiceData(prev => ({
                                ...prev,
                                dnaAnimation: {
                                  ...prev.dnaAnimation,
                                  data: prev.dnaAnimation.data.filter((_, i) => i !== index)
                                }
                              }))}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <input
                              type="text"
                              value={dataPoint.title}
                              onChange={(e) => {
                                const newData = [...serviceData.dnaAnimation.data]
                                newData[index].title = e.target.value
                                setServiceData(prev => ({
                                  ...prev,
                                  dnaAnimation: { ...prev.dnaAnimation, data: newData }
                                }))
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Title"
                              disabled={!canWrite}
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={dataPoint.text}
                              onChange={(e) => {
                                const newData = [...serviceData.dnaAnimation.data]
                                newData[index].text = e.target.value
                                setServiceData(prev => ({
                                  ...prev,
                                  dnaAnimation: { ...prev.dnaAnimation, data: newData }
                                }))
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Text"
                              disabled={!canWrite}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Why Work With Us */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <SectionHeader 
              title="Why Work With Us" 
              icon={Users}
              section="whyWorkWithUs"
              description="Highlight your company's unique advantages"
            />
            {expandedSections.whyWorkWithUs && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-gray-600">
                      Showcase what makes your company the best choice
                    </p>
                  </div>
                  {canWrite && (
                    <button
                      onClick={addWhyWorkWithUs}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  {serviceData.whyWorkWithUs.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-900">Item {index + 1}</h3>
                        {canWrite && (
                          <button
                            onClick={() => removeWhyWorkWithUs(index)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => {
                              const newItems = [...serviceData.whyWorkWithUs]
                              newItems[index].title = e.target.value
                              setServiceData(prev => ({ ...prev, whyWorkWithUs: newItems }))
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            disabled={!canWrite}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                          <input
                            type="text"
                            value={item.icon}
                            onChange={(e) => {
                              const newItems = [...serviceData.whyWorkWithUs]
                              newItems[index].icon = e.target.value
                              setServiceData(prev => ({ ...prev, whyWorkWithUs: newItems }))
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Icon class or URL"
                            disabled={!canWrite}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                          <textarea
                            value={item.description}
                            onChange={(e) => {
                              const newItems = [...serviceData.whyWorkWithUs]
                              newItems[index].description = e.target.value
                              setServiceData(prev => ({ ...prev, whyWorkWithUs: newItems }))
                            }}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                            disabled={!canWrite}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {serviceData.whyWorkWithUs.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">No items added yet</p>
                      <p className="text-gray-400 text-sm">Click "Add Item" to get started</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* CTA Section */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <SectionHeader 
              title="CTA Section" 
              icon={Target}
              section="cta"
              description="Call-to-action section with background image"
            />
            {expandedSections.cta && (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <input
                        type="text"
                        value={serviceData.ctaSection.title}
                        onChange={(e) => setServiceData(prev => ({
                          ...prev,
                          ctaSection: { ...prev.ctaSection, title: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        disabled={!canWrite}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={serviceData.ctaSection.description}
                        onChange={(e) => setServiceData(prev => ({
                          ...prev,
                          ctaSection: { ...prev.ctaSection, description: e.target.value }
                        }))}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                        disabled={!canWrite}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Primary CTA Text</label>
                        <input
                          type="text"
                          value={serviceData.ctaSection.primaryCTA.text}
                          onChange={(e) => setServiceData(prev => ({
                            ...prev,
                            ctaSection: {
                              ...prev.ctaSection,
                              primaryCTA: { ...prev.ctaSection.primaryCTA, text: e.target.value }
                            }
                          }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          disabled={!canWrite}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Primary CTA Link</label>
                        <input
                          type="text"
                          value={serviceData.ctaSection.primaryCTA.link}
                          onChange={(e) => setServiceData(prev => ({
                            ...prev,
                            ctaSection: {
                              ...prev.ctaSection,
                              primaryCTA: { ...prev.ctaSection.primaryCTA, link: e.target.value }
                            }
                          }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          disabled={!canWrite}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <ImageUpload
                      currentImage={serviceData.ctaSection.backgroundImage}
                      onImageChange={(imageUrl) => setServiceData(prev => ({
                        ...prev,
                        ctaSection: { ...prev.ctaSection, backgroundImage: imageUrl }
                      }))}
                      label="Background Image"
                      disabled={!canWrite}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SEO Metadata */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <SectionHeader 
              title="SEO Metadata" 
              icon={Target}
              section="seo"
              description="Search engine optimization settings"
            />
            {expandedSections.seo && (
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SEO Title</label>
                  <input
                    type="text"
                    value={serviceData.seoMetadata.title}
                    onChange={(e) => setServiceData(prev => ({
                      ...prev,
                      seoMetadata: { ...prev.seoMetadata, title: e.target.value }
                    }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    disabled={!canWrite}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}