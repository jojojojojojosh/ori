"use client"

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function ImplicitCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/project'

  useEffect(() => {
    const handleImplicitFlow = async () => {
      try {
        // Get the URL fragment (everything after #)
        const fragment = window.location.hash.substring(1)
        
        if (!fragment) {
          console.error('No fragment found in URL')
          router.push('/login?error=auth_callback_error&message=no_fragment')
          return
        }

        // Parse the fragment parameters
        const params = new URLSearchParams(fragment)
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        const expiresIn = params.get('expires_in')
        const tokenType = params.get('token_type')
        const error = params.get('error')

        if (error) {
          console.error('OAuth error in fragment:', error)
          router.push(`/login?error=oauth_error&message=${encodeURIComponent(error)}`)
          return
        }

        if (!accessToken) {
          console.error('No access token found in fragment')
          router.push('/login?error=auth_callback_error&message=no_access_token')
          return
        }

        // Set the session using the tokens from the fragment
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        })

        if (sessionError) {
          console.error('Error setting session:', sessionError)
          router.push(`/login?error=auth_session_error&message=${encodeURIComponent(sessionError.message)}`)
          return
        }

        if (data.session) {
          console.log('Session set successfully')
          // Clear the URL fragment for security
          window.history.replaceState({}, document.title, window.location.pathname + window.location.search)
          // Redirect to the intended destination
          router.push(next)
        } else {
          console.error('No session created')
          router.push('/login?error=auth_callback_error&message=no_session_created')
        }
      } catch (err) {
        console.error('Unexpected error in implicit callback:', err)
        router.push('/login?error=auth_callback_error&message=unexpected_error')
      }
    }

    handleImplicitFlow()
  }, [router, next])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">인증 처리 중...</p>
      </div>
    </div>
  )
}

export default function ImplicitCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <ImplicitCallbackContent />
    </Suspense>
  )
}