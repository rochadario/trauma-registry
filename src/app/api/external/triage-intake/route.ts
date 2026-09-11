import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

// Receives quick-assessment payloads from the RESPOND Triage app (trauma-algo-proto)
// and creates a draft patient record. Authenticated with a shared secret (not a user
// session) since the triage app has no login. Always attributed to the dedicated
// service account (see TRIAGE_BOT_USER_ID) rather than a real registry user.
export const runtime = 'nodejs'

const TRIAGE_BOT_USER_ID = 'f0a5655e-7962-4dd1-bc15-b01b77b30e42'

const SEX_MAP: Record<string, string> = {
  male: 'male',
  female: 'female',
}

const MECHANISM_MAP: Record<string, string> = {
  gun: 'firearm',
  stab: 'sharp_object',
  polytrauma: 'other',
  otro: 'other',
}

const COLOR_MAP: Record<string, string> = {
  rojo: 'red',
  amarillo: 'yellow',
  verde: 'green',
  negro: 'black',
}

function parseElapsedToMinutes(elapsed: unknown): number | null {
  if (typeof elapsed !== 'string') return null
  const m = elapsed.match(/^(\d+):(\d{2})$/)
  if (!m) return null
  const minutes = parseInt(m[1], 10)
  const seconds = parseInt(m[2], 10)
  // response_time_minutes is an integer column in the DB
  return Math.round(minutes + seconds / 60)
}

export async function POST(request: Request) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.TRIAGE_INGEST_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const findingsByLetter = (body.findings ?? null) as Record<string, unknown> | null
  const tourniquetApplied =
    !!findingsByLetter && Array.isArray(findingsByLetter.X) && findingsByLetter.X.includes('x_tourniquet')
  const pressureApplied =
    !!findingsByLetter && Array.isArray(findingsByLetter.X) && findingsByLetter.X.includes('x_stopped_pressure')
  const hemorrhageFindingPresent =
    !!findingsByLetter &&
    Array.isArray(findingsByLetter.X) &&
    findingsByLetter.X.some((id) => id !== 'x_none')

  const record: Record<string, unknown> = {
    local_id: typeof body.localId === 'string' && body.localId ? body.localId : uuidv4(),
    created_by: TRIAGE_BOT_USER_ID,
    record_status: 'draft',
    admission_date: new Date().toISOString().slice(0, 10),
    admission_time: new Date().toISOString().slice(11, 16),
    hospital_other: typeof body.hospitalName === 'string' ? body.hospitalName : null,

    patient_sex: typeof body.sex === 'string' ? SEX_MAP[body.sex] ?? null : null,
    bombero_age_range: typeof body.ageRange === 'string' ? body.ageRange : null,
    bombero_name: typeof body.bomberoName === 'string' && body.bomberoName ? body.bomberoName : null,
    injury_mechanism: typeof body.mechanism === 'string' ? MECHANISM_MAP[body.mechanism] ?? 'other' : null,

    triage_bombero: typeof body.color === 'string' ? COLOR_MAP[body.color] ?? null : null,
    bombero_findings: findingsByLetter,

    injury_lat: typeof body.lat === 'number' ? body.lat : null,
    injury_lng: typeof body.lng === 'number' ? body.lng : null,
    bombero_hospital_distance_km: typeof body.hospitalDistanceKm === 'number' ? body.hospitalDistanceKm : null,
    bombero_hospital_eta_min: typeof body.hospitalEtaMin === 'number' ? body.hospitalEtaMin : null,

    response_time_minutes: parseElapsedToMinutes(body.elapsed),

    prehospital_care: true,
    prehospital_provider: 'bomberos',
    prehospital_hemorrhage_needed: hemorrhageFindingPresent || null,
    prehospital_direct_pressure: pressureApplied || null,
    prehospital_tourniquet: tourniquetApplied || null,
    prehospital_tourniquet_correct: tourniquetApplied ? 'yes' : null,
  }

  const { error } = await supabase
    .from('patients')
    .upsert(record, { onConflict: 'local_id' })

  if (error) {
    console.error('triage-intake upsert error:', error.message)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, local_id: record.local_id })
}
