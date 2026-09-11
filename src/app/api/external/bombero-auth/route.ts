import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Verifies a Google Identity Services ID token (from trauma-algo-proto's
// "Sign in with Google" button) directly against Google's tokeninfo endpoint,
// then upserts a bombero_profiles row. Deliberately does NOT use Supabase
// Auth / auth.users — bomberos must never end up in the same identity pool
// as hospital registrars/admins (see migration_bomberos.sql for why).
export const runtime = 'nodejs'

interface GoogleTokenInfo {
  sub: string
  email?: string
  name?: string
  picture?: string
  aud: string
  exp: string
  error_description?: string
}

export async function POST(request: Request) {
  let body: { idToken?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (typeof body.idToken !== 'string' || !body.idToken) {
    return NextResponse.json({ error: 'Missing idToken' }, { status: 400 })
  }

  const verifyRes = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(body.idToken)}`
  )
  const info: GoogleTokenInfo = await verifyRes.json()

  if (!verifyRes.ok || info.error_description) {
    return NextResponse.json({ error: 'Invalid Google token' }, { status: 401 })
  }

  if (info.aud !== process.env.GOOGLE_BOMBERO_CLIENT_ID) {
    return NextResponse.json({ error: 'Token audience mismatch' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabase.from('bombero_profiles').upsert(
    {
      id: info.sub,
      email: info.email ?? null,
      display_name: info.name ?? null,
      photo_url: info.picture ?? null,
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  )

  if (error) {
    console.error('bombero-auth upsert error:', error.message)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    bomberoId: info.sub,
    name: info.name ?? null,
    email: info.email ?? null,
    photoUrl: info.picture ?? null,
  })
}
