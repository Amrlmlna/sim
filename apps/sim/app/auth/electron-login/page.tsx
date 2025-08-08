'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createLogger } from '@/lib/logs/console/logger'

const logger = createLogger('ElectronLogin')

export default function ElectronLoginPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const handleElectronLogin = async () => {
      const sessionToken = searchParams.get('session_token')
      const sessionData = searchParams.get('session_data')
      const hasLoggedInBefore = searchParams.get('has_logged_in_before')
      const from = searchParams.get('from')

      if (from !== 'electron' || !sessionToken || !sessionData) {
        logger.error('Invalid electron login parameters')
        router.push('/login')
        return
      }

      try {
        logger.info('Setting authentication cookies from Electron data')

        // Set the authentication cookies using document.cookie
        // Note: We can only set non-httpOnly cookies from client-side
        const cookieOptions = 'path=/; SameSite=Lax'
        
        // Set session token cookie
        document.cookie = `better-auth.session_token=${sessionToken}; ${cookieOptions}`
        
        // Set session data cookie  
        document.cookie = `better-auth.session_data=${sessionData}; ${cookieOptions}`
        
        // Set has_logged_in_before if provided
        if (hasLoggedInBefore) {
          document.cookie = `has_logged_in_before=${hasLoggedInBefore}; ${cookieOptions}`
        }

        logger.info('Cookies set successfully, redirecting to workspace')
        
        // Small delay to ensure cookies are set before redirect
        setTimeout(() => {
          router.push('/workspace')
        }, 100)

      } catch (error) {
        logger.error('Failed to set authentication cookies:', error)
        router.push('/login')
      }
    }

    handleElectronLogin()
  }, [searchParams, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Setting up your session...</p>
      </div>
    </div>
  )
}
