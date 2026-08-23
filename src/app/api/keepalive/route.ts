import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Keeps Supabase free tier from pausing — pinged daily by an external
// cron (cron-job.org), same pattern as Open Trauma Registry. Public and
// unauthenticated on purpose: external cron services can't send the
// CRON_SECRET header, and this route only does a minimal read.

export const runtime = 'edge'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Missing env vars' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Lightweight query — just checks DB is alive
  const { error } = await supabase.from('patients').select('id').limit(1)

  if (error) {
    console.error('[keepalive] Supabase error:', error.message)
    return NextResponse.json(
      { ok: false, error: error.message, ts: new Date().toISOString() },
      { status: 500 }
    )
  }

  console.log('[keepalive] Supabase ping OK at', new Date().toISOString())
  return NextResponse.json({ ok: true, ts: new Date().toISOString() })
}
