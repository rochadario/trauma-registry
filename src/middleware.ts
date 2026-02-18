import createMiddleware from 'next-intl/middleware'
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { routing } from '@/lib/i18n/routing'

const intlMiddleware = createMiddleware(routing)

export async function middleware(request: NextRequest) {
  // First handle i18n routing
  const intlResponse = intlMiddleware(request)

  // Then handle Supabase session
  const supabaseResponse = await updateSession(request)

  // If Supabase wants to redirect, use that
  if (supabaseResponse.headers.get('location')) {
    return supabaseResponse
  }

  // Merge cookies from Supabase into intl response
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value)
  })

  return intlResponse
}

export const config = {
  matcher: ['/', '/(es|en)/:path*'],
}
