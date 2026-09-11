import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

// Admin-only aggregate view across the bombero (firefighter) app and the
// hospital patients table. Gated by the caller's own session + profiles.role
// (the same role system hospital registrars/admins already use) — this is
// the ONE place that is allowed to read across both sides, since bomberos
// themselves never get any access to patients, and registrars never get
// access to bombero data.
export const runtime = 'nodejs'

export async function GET() {
  const supabaseAuth = await createServerClient()
  const { data: userData } = await supabaseAuth.auth.getUser()
  if (!userData.user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const { data: profile } = await supabaseAuth
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Admins only' }, { status: 403 })
  }

  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [bomberosRes, progressRes, patientsRes, alertsRes] = await Promise.all([
    supabase.from('bombero_profiles').select('id, display_name, email, photo_url, created_at, last_seen_at'),
    supabase.from('bombero_training_progress').select('bombero_id, module_letter, best_score'),
    supabase
      .from('patients')
      .select('bombero_id, bombero_name, triage_bombero, response_time_minutes, created_at')
      .not('bombero_id', 'is', null),
    supabase
      .from('alert_log')
      .select('success, created_at')
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  const bomberos = bomberosRes.data ?? []
  const progress = progressRes.data ?? []
  const patients = patientsRes.data ?? []
  const alerts = alertsRes.data ?? []

  const progressByBombero: Record<string, Set<string>> = {}
  progress.forEach((p) => {
    if (!progressByBombero[p.bombero_id]) progressByBombero[p.bombero_id] = new Set()
    progressByBombero[p.bombero_id].add(p.module_letter)
  })

  const patientsByBombero: Record<string, number> = {}
  patients.forEach((p) => {
    if (!p.bombero_id) return
    patientsByBombero[p.bombero_id] = (patientsByBombero[p.bombero_id] ?? 0) + 1
  })

  const bomberoRows = bomberos.map((b) => ({
    id: b.id,
    name: b.display_name,
    email: b.email,
    photoUrl: b.photo_url,
    createdAt: b.created_at,
    lastSeenAt: b.last_seen_at,
    active: new Date(b.last_seen_at) >= new Date(thirtyDaysAgo),
    trainingsCompleted: progressByBombero[b.id]?.size ?? 0,
    patientsSent: patientsByBombero[b.id] ?? 0,
  }))

  const colorCounts: Record<string, number> = { red: 0, yellow: 0, green: 0, black: 0 }
  let responseTimeSum = 0
  let responseTimeCount = 0
  patients.forEach((p) => {
    if (p.triage_bombero && colorCounts[p.triage_bombero] !== undefined) colorCounts[p.triage_bombero]++
    if (typeof p.response_time_minutes === 'number') {
      responseTimeSum += p.response_time_minutes
      responseTimeCount++
    }
  })

  const recentAlerts = alerts.slice(0, 20)
  const lastSuccessfulAlert = alerts.find((a) => a.success)?.created_at ?? null
  const successCount = recentAlerts.filter((a) => a.success).length

  return NextResponse.json({
    ok: true,
    summary: {
      totalBomberos: bomberos.length,
      activeBomberos: bomberoRows.filter((b) => b.active).length,
      totalPatientsSent: patients.length,
      avgResponseTimeMin: responseTimeCount > 0 ? Math.round((responseTimeSum / responseTimeCount) * 10) / 10 : null,
      colorCounts,
      lastSuccessfulAlert,
      alertSuccessRate: recentAlerts.length > 0 ? Math.round((successCount / recentAlerts.length) * 100) : null,
      alertsChecked: recentAlerts.length,
    },
    bomberos: bomberoRows.sort((a, b) => (b.lastSeenAt > a.lastSeenAt ? 1 : -1)),
  })
}
