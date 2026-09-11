import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { corsHeaders, corsPreflight } from '@/lib/cors'

// Reads/writes a bombero's Didactics progress (per XABCDE module letter).
// Trusts the client-supplied bomberoId without re-verifying the Google token
// on every call — deliberate, low-risk tradeoff: the worst outcome of
// spoofing here is an inflated training score, never patient data (that
// path is separately locked down in /api/external/triage-intake).
export const runtime = 'nodejs'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function OPTIONS() {
  return corsPreflight()
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const bomberoId = searchParams.get('bomberoId')
  if (!bomberoId) {
    return NextResponse.json({ error: 'Missing bomberoId' }, { status: 400, headers: corsHeaders() })
  }

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('bombero_training_progress')
    .select('module_letter, best_score')
    .eq('bombero_id', bomberoId)

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500, headers: corsHeaders() })
  }

  const progress: Record<string, number> = {}
  for (const row of data) progress[row.module_letter] = row.best_score
  return NextResponse.json({ ok: true, progress }, { headers: corsHeaders() })
}

export async function POST(request: Request) {
  let body: { bomberoId?: unknown; moduleLetter?: unknown; score?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers: corsHeaders() })
  }

  if (
    typeof body.bomberoId !== 'string' || !body.bomberoId ||
    typeof body.moduleLetter !== 'string' || !body.moduleLetter ||
    typeof body.score !== 'number'
  ) {
    return NextResponse.json({ error: 'Missing bomberoId, moduleLetter, or score' }, { status: 400, headers: corsHeaders() })
  }

  const supabase = getSupabase()

  const { data: existing } = await supabase
    .from('bombero_training_progress')
    .select('best_score')
    .eq('bombero_id', body.bomberoId)
    .eq('module_letter', body.moduleLetter)
    .maybeSingle()

  const bestScore = existing ? Math.max(existing.best_score, body.score) : body.score

  const { error } = await supabase.from('bombero_training_progress').upsert(
    {
      bombero_id: body.bomberoId,
      module_letter: body.moduleLetter,
      best_score: bestScore,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'bombero_id,module_letter' }
  )

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500, headers: corsHeaders() })
  }

  return NextResponse.json({ ok: true, bestScore }, { headers: corsHeaders() })
}
