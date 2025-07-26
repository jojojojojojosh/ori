import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/project'

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error)
    return NextResponse.redirect(`${origin}/login?error=oauth_error&message=${encodeURIComponent(error)}`)
  }

  // Handle PKCE flow with authorization code
  if (code) {
    try {
      // Create a server-side Supabase client
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      if (!exchangeError) {
        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'
        
        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${next}`)
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`)
        } else {
          return NextResponse.redirect(`${origin}${next}`)
        }
      } else {
        console.error('Error exchanging code for session:', exchangeError)
        return NextResponse.redirect(`${origin}/login?error=auth_exchange_error&message=${encodeURIComponent(exchangeError.message)}`)
      }
    } catch (err) {
      console.error('Unexpected error in auth callback:', err)
      return NextResponse.redirect(`${origin}/login?error=auth_callback_error&message=unexpected_error`)
    }
  }

  // Handle implicit flow (when access_token is in URL fragment)
  // This will be handled by client-side JavaScript
  const hasFragment = request.url.includes('#')
  if (hasFragment) {
    // For implicit flow, redirect to a client-side handler
    return NextResponse.redirect(`${origin}/auth/implicit-callback?next=${encodeURIComponent(next)}`)
  }

  // No code or error - invalid callback
  console.error('Auth callback called without code or error parameters')
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error&message=missing_parameters`)
}