# Vercel Authentication Troubleshooting Guide

## Issue: "Authentication required. Please log in again." on Image Upload

### Root Causes Identified:

1. **Cookie Domain Configuration**: Production cookies were restricted to `.altiorainfotech.com` domain
2. **CSRF Token Missing**: Upload requests weren't including CSRF tokens
3. **Cookie Name Mismatch**: Production uses `__Secure-next-auth.session-token` vs development's `next-auth.session-token`

### Fixes Applied:

#### 1. Fixed Cookie Domain Configuration
- **File**: `lib/auth.ts`
- **Change**: Removed domain restriction for cookies
- **Before**: `domain: process.env.NODE_ENV === 'production' ? '.altiorainfotech.com' : undefined`
- **After**: `domain: undefined`

#### 2. Added CSRF Token to Upload Requests
- **File**: `app/components/admin/BlogImageUpload.tsx`
- **Change**: Extract and send CSRF token with upload requests
- **Added**: CSRF token extraction from cookies and X-CSRF-Token header

#### 3. Fixed Cookie Name Handling in API
- **File**: `app/api/upload/route.ts`
- **Change**: Use correct cookie name for production environment
- **Added**: Proper cookieName parameter in getToken calls

#### 4. Enhanced Debugging
- **File**: `lib/auth-debug.ts` (new)
- **Purpose**: Debug authentication issues in production
- **Features**: Logs cookie presence, token verification, environment details

### Environment Variables to Verify:

Ensure these are set in Vercel:
```bash
NEXTAUTH_SECRET=your-secure-secret-here
NEXTAUTH_URL=https://your-domain.vercel.app
NODE_ENV=production
```

### Testing Steps:

1. **Deploy the fixes to Vercel**
2. **Clear browser cookies** for the admin domain
3. **Log in again** to get fresh authentication cookies
4. **Try uploading an image** in the blog editor
5. **Check Vercel logs** for authentication debug information

### Additional Debugging:

If issues persist, check:
1. Vercel function logs for authentication debug output
2. Browser developer tools for cookie presence
3. Network tab for request headers and responses
4. Ensure NEXTAUTH_SECRET matches between local and production

### Fallback Solutions:

If authentication still fails:
1. Try logging out and logging back in
2. Clear all browser data for the domain
3. Check if the issue occurs in incognito mode
4. Verify environment variables in Vercel dashboard