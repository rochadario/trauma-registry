import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Extract locale from path
  const localeMatch = pathname.match(/^\/(en|es)/)
  const locale = localeMatch ? localeMatch[1] : 'es'

  const isAuthPage = pathname.includes('/login') || pathname.includes('/register')
  const isDemoPage = pathname.includes('/demo')
  const isRootPage = pathname === `/${locale}` || pathname === '/'

  // Auth pages - redirect to app if already logged in
  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/patients`
    return NextResponse.redirect(url)
  }

  // Protected pages - redirect to login if not logged in
  if (!user && !isAuthPage && !isRootPage && !isDemoPage) {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/login`
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
