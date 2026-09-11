import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Records whether a Telegram alert send from trauma-algo-proto succeeded or
// failed, so the admin dashboard can show "alert system health" (last
// successful send, recent error rate) instead of that being invisible.
export const runtime = 'nodejs'

export async function POST(request: Request) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.TRIAGE_INGEST_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { success?: unknown; bomberoId?: unknown; errorMessage?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabase.from('alert_log').insert({
    success: !!body.success,
    bombero_id: typeof body.bomberoId === 'string' ? body.bomberoId : null,
    error_message: typeof body.errorMessage === 'string' ? body.errorMessage : null,
  })

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
