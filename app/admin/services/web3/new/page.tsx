'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function NewWeb3Service() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the main service editor with 'new' as the serviceType
    router.replace('/admin/services/web3/new-service')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}