'use client'

import { performCompleteLogout } from '@/lib/logout-utils'

export default function RefreshSession() {
  const handleRefreshSession = async () => {
    await performCompleteLogout()
  }

  return (
    <div className="bg-yellow-800 border border-yellow-600 rounded-lg p-4 mb-4">
      <h3 className="text-yellow-100 font-bold mb-2">Session Update Required</h3>
      <p className="text-yellow-200 text-sm mb-3">
        Your session needs to be refreshed to include the new permission system. 
        Please log out and log back in.
      </p>
      <button
        onClick={handleRefreshSession}
        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded text-sm"
      >
        Refresh Session (Logout & Login)
      </button>
    </div>
  )
}