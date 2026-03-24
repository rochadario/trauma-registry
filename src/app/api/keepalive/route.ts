import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Vercel Cron Job — keeps Supabase free tier from pausing
// Runs daily at 09:00 UTC (configured in vercel.json)
// Supabase pauses after 7 days inactivity; daily ping prevents that.

export const runtime = 'edge'

export async function GET(request: Request) {
  // Verify this is called by Vercel Cron (not a random visitor)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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
