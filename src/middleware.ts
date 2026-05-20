import createMiddleware from 'next-intl/middleware'
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { routing } from '@/lib/i18n/routing'

const intlMiddleware = createMiddleware(routing)

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const host = request.headers.get('host') ?? ''
  const localeMatch = pathname.match(/^\/(en|es)/)
  const locale = localeMatch ? localeMatch[1] : 'es'
  const isRootPage = pathname === `/${locale}` || pathname === '/'

  // /demo shortcut → /en/demo
  if (pathname === '/demo') {
    const url = request.nextUrl.clone()
    url.pathname = '/en/demo'
    return NextResponse.redirect(url)
  }

  // respondtraumaregistry.com: root → login directly (no landing page)
  if (host.includes('respondtraumaregistry.com') && isRootPage) {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/login`
    return NextResponse.redirect(url)
  }

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

  // Ensure all cookies have Secure flag in production
  if (process.env.NODE_ENV === 'production') {
    intlResponse.cookies.getAll().forEach((cookie) => {
      intlResponse.cookies.set({
        ...cookie,
        secure: true,
        sameSite: 'lax',
      })
    })
  }

  return intlResponse
}

export const config = {
  matcher: ['/', '/demo', '/(es|en)/:path*'],
}
