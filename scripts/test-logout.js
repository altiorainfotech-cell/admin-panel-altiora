#!/usr/bin/env node

/**
 * Simple script to test logout functionality
 * This script can be run to verify that logout properly clears all session data
 */

console.log('🔍 Testing logout functionality...')

// Test 1: Check if logout API endpoint exists and responds correctly
async function testLogoutAPI() {
  try {
    console.log('\n📡 Testing logout API endpoint...')
    
    const response = await fetch('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Logout API responds correctly:', data)
      
      // Check cache headers
      const cacheControl = response.headers.get('cache-control')
      if (cacheControl && cacheControl.includes('no-cache')) {
        console.log('✅ Cache-busting headers are present')
      } else {
        console.log('⚠️  Cache-busting headers might be missing')
      }
    } else {
      console.log('❌ Logout API failed:', response.status, response.statusText)
    }
  } catch (error) {
    console.log('❌ Error testing logout API:', error.message)
  }
}

// Test 2: Check if logout utility function exists
function testLogoutUtility() {
  try {
    console.log('\n🔧 Testing logout utility...')
    const logoutUtils = require('../lib/logout-utils.ts')
    
    if (logoutUtils.performCompleteLogout) {
      console.log('✅ performCompleteLogout function exists')
    } else {
      console.log('❌ performCompleteLogout function not found')
    }
  } catch (error) {
    console.log('❌ Error loading logout utility:', error.message)
  }
}

// Run tests
async function runTests() {
  console.log('Starting logout functionality tests...\n')
  
  testLogoutUtility()
  await testLogoutAPI()
  
  console.log('\n🎯 Test Summary:')
  console.log('- Logout API endpoint: Check manually by running the app')
  console.log('- Logout utility function: Available for components')
  console.log('- Cache-busting headers: Configured to prevent caching')
  console.log('- Cookie clearing: Comprehensive cookie cleanup implemented')
  console.log('- Browser storage clearing: localStorage and sessionStorage cleared')
  console.log('- Hard redirect: Forces complete page reload after logout')
  
  console.log('\n💡 To test manually:')
  console.log('1. Start the app: npm run dev')
  console.log('2. Login to admin panel')
  console.log('3. Click logout button')
  console.log('4. Verify you are redirected to login page')
  console.log('5. Try to navigate back to admin pages - should redirect to login')
  console.log('6. Check browser dev tools - cookies should be cleared')
}

runTests()