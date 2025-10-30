import { signOut } from 'next-auth/react'

/**
 * Performs a complete logout by clearing server-side session, client-side session,
 * and all browser storage, then redirects to login page
 */
export async function performCompleteLogout(): Promise<void> {
  try {
    // Step 1: Call our custom logout API to clear server-side session and cookies
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    // Step 2: Use NextAuth signOut to clear client-side session
    await signOut({ 
      redirect: false // We'll handle redirect manually
    })
    
    // Step 3: Clear any remaining browser storage
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
      
      // Clear any additional cookies that might persist
      const cookiesToClear = [
        'next-auth.session-token',
        '__Secure-next-auth.session-token',
        'next-auth.csrf-token',
        '__Host-next-auth.csrf-token',
        'next-auth.callback-url',
        '__Secure-next-auth.callback-url',
        'csrf-token'
      ]
      
      cookiesToClear.forEach(cookieName => {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`
      })
    }
    
    // Step 4: Force a hard redirect to ensure clean state
    window.location.replace('/admin/login')
  } catch (error) {
    console.error('Complete logout error:', error)
    
    // Fallback: clear everything manually and redirect
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
      
      // Clear all cookies manually as fallback
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      })
    }
    
    window.location.replace('/admin/login')
  }
}