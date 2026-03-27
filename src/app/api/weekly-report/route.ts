import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

// Vercel Cron — runs every Monday at 07:00 UTC
// Also callable manually with ?preview=1 to skip auth (dev only)
export const runtime = 'nodejs'

interface PatientRow {
  data: Record<string, unknown>
}

interface ReportConfig {
  id: string
  hospital_id: string | null
  recipient_emails: string[]
  enabled: boolean
  last_sent_at: string | null
  report_sections: string[] | null
}

function buildEmailHtml(stats: {
  weekLabel: string
  total: number
  deaths: number
  mortalityPct: string
  avgISS: string
  avgLOS: string
  avgResponse: string
  topMechanisms: { name: string; count: number; pct: string }[]
  issBreakdown: { label: string; count: number }[]
  hospitalId: string | null
  sections: string[]
  completenessRows: { label: string; pct: number }[]
}): string {
  const {
    weekLabel, total, deaths, mortalityPct, avgISS, avgLOS,
    avgResponse, topMechanisms, issBreakdown, hospitalId, sections, completenessRows,
  } = stats
  const has = (s: string) => sections.includes(s)

  const mechRows = topMechanisms.map(m =>
    `<tr>
      <td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;">${m.name}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">${m.count}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">${m.pct}%</td>
    </tr>`
  ).join('')

  const issRows = issBreakdown.map(i =>
    `<tr>
      <td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;">${i.label}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">${i.count}</td>
    </tr>`
  ).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:#1B3A6B;padding:28px 32px;">
      <p style="margin:0;color:#AED6F1;font-size:13px;letter-spacing:1px;text-transform:uppercase;">RESPOND Guatemala</p>
      <h1 style="margin:8px 0 4px;color:#fff;font-size:22px;font-weight:700;">Weekly Trauma Report</h1>
      <p style="margin:0;color:#AED6F1;font-size:14px;">${weekLabel}${hospitalId ? ` · ${hospitalId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}` : ''}</p>
    </div>

    <!-- Key metrics -->
    ${has('summary') || has('mortality') ? `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0;border-bottom:1px solid #e8ecf0;">
      ${[
        has('summary') ? { label: 'Patients', value: String(total), color: '#1B3A6B' } : null,
        has('mortality') ? { label: 'Mortality', value: `${mortalityPct}%`, color: deaths > 0 ? '#C0392B' : '#1E8B4C' } : null,
        has('mortality') ? { label: 'Deaths', value: String(deaths), color: deaths > 0 ? '#C0392B' : '#6b7280' } : null,
      ].filter(Boolean).map(m => `
        <div style="padding:20px;text-align:center;border-right:1px solid #e8ecf0;">
          <p style="margin:0;font-size:28px;font-weight:700;color:${(m as {color:string}).color};">${(m as {value:string}).value}</p>
          <p style="margin:4px 0 0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">${(m as {label:string}).label}</p>
        </div>`).join('')}
    </div>` : ''}
    ${has('avgs') ? `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0;border-bottom:2px solid #e8ecf0;">
      ${[
        { label: 'Avg ISS', value: avgISS },
        { label: 'Avg LOS', value: avgLOS !== '—' ? `${avgLOS}d` : '—' },
        { label: 'Avg Response', value: avgResponse !== '—' ? `${avgResponse} min` : '—' },
      ].map(m => `
        <div style="padding:16px;text-align:center;border-right:1px solid #e8ecf0;">
          <p style="margin:0;font-size:22px;font-weight:600;color:#2C3E50;">${m.value}</p>
          <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">${m.label}</p>
        </div>`).join('')}
    </div>` : ''}

    <div style="padding:24px 32px;">

      ${total === 0 ? '<p style="color:#6b7280;font-size:14px;">No patients recorded this week.</p>' : ''}

      ${has('mechanisms') && total > 0 ? `
      <!-- Mechanisms -->
      <h2 style="margin:0 0 12px;font-size:14px;font-weight:600;color:#1B3A6B;text-transform:uppercase;letter-spacing:0.5px;">Top Injury Mechanisms</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr style="background:#f5f7fa;">
            <th style="padding:8px 12px;text-align:left;font-weight:600;color:#6b7280;font-size:12px;text-transform:uppercase;">Mechanism</th>
            <th style="padding:8px 12px;text-align:right;font-weight:600;color:#6b7280;font-size:12px;text-transform:uppercase;">N</th>
            <th style="padding:8px 12px;text-align:right;font-weight:600;color:#6b7280;font-size:12px;text-transform:uppercase;">%</th>
          </tr>
        </thead>
        <tbody>${mechRows}</tbody>
      </table>` : ''}

      ${has('iss') && issBreakdown.length > 0 ? `
      <!-- ISS Severity -->
      <h2 style="margin:24px 0 12px;font-size:14px;font-weight:600;color:#1B3A6B;text-transform:uppercase;letter-spacing:0.5px;">Injury Severity (ISS)</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tbody>${issRows}</tbody>
      </table>` : ''}

      ${has('completeness') && completenessRows.length > 0 ? `
      <!-- Data Completeness -->
      <h2 style="margin:24px 0 12px;font-size:14px;font-weight:600;color:#1B3A6B;text-transform:uppercase;letter-spacing:0.5px;">Data Completeness</h2>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <tbody>
          ${completenessRows.map(r => `
          <tr>
            <td style="padding:5px 12px;border-bottom:1px solid #f0f0f0;">${r.label}</td>
            <td style="padding:5px 12px;border-bottom:1px solid #f0f0f0;text-align:right;color:${r.pct >= 80 ? '#16a34a' : r.pct >= 60 ? '#ca8a04' : '#dc2626'};">
              ${r.pct}%
            </td>
          </tr>`).join('')}
        </tbody>
      </table>` : ''}

    </div>

    <!-- Footer -->
    <div style="background:#f5f7fa;padding:16px 32px;border-top:1px solid #e8ecf0;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">
        Generated automatically by RESPOND Guatemala Trauma Registry ·
        <a href="https://trauma-registry.vercel.app" style="color:#2563eb;">trauma-registry.vercel.app</a>
      </p>
      <p style="margin:4px 0 0;font-size:11px;color:#9ca3af;">
        To unsubscribe or change report settings, log in and visit Report Configuration.
      </p>
    </div>
  </div>
</body>
</html>`
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const isPreview = searchParams.get('preview') === '1'

  // Auth check (skip in preview mode for local testing)
  if (!isPreview) {
    const auth = request.headers.get('authorization')
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Fetch enabled report configs
  const { data: configs, error: configErr } = await supabase
    .from('report_configs')
    .select('*')
    .eq('enabled', true)

  if (configErr) {
    return NextResponse.json({ error: configErr.message }, { status: 500 })
  }

  if (!configs || configs.length === 0) {
    return NextResponse.json({ ok: true, message: 'No enabled report configs' })
  }

  // Date range: last 7 days
  const now = new Date()
  const weekAgo = new Date(now)
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekAgoStr = weekAgo.toISOString().slice(0, 10)
  const nowStr = now.toISOString().slice(0, 10)

  const weekLabel = `${weekAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`

  const resend = new Resend(process.env.RESEND_API_KEY)
  const results: { config_id: string; sent: number; error?: string }[] = []

  for (const config of configs as ReportConfig[]) {
    if (!config.recipient_emails?.length) continue

    // Fetch patients for this week (filter by hospital if set)
    let query = supabase
      .from('patients')
      .select('data')
      .gte('data->>admission_date', weekAgoStr)
      .lte('data->>admission_date', nowStr)
      .neq('data->>record_status', 'draft')

    if (config.hospital_id) {
      query = query.eq('data->>hospital_id', config.hospital_id)
    }

    const { data: patients, error: pErr } = await query
    if (pErr) { results.push({ config_id: config.id, sent: 0, error: pErr.message }); continue }

    const rows = (patients ?? []) as PatientRow[]
    const total = rows.length
    const deaths = rows.filter(p => (p.data.outcome as string)?.startsWith('died')).length
    const mortalityPct = total > 0 ? ((deaths / total) * 100).toFixed(1) : '0'

    const issVals = rows.map(p => p.data.iss_score as number).filter(v => v > 0)
    const avgISS = issVals.length ? (issVals.reduce((a, b) => a + b) / issVals.length).toFixed(1) : '—'

    const losVals = rows.map(p => p.data.los_days as number).filter(v => v >= 0)
    const avgLOS = losVals.length ? (losVals.reduce((a, b) => a + b) / losVals.length).toFixed(1) : '—'

    const rtVals = rows.map(p => p.data.response_time_minutes as number).filter(v => v > 0)
    const avgResponse = rtVals.length ? String(Math.round(rtVals.reduce((a, b) => a + b) / rtVals.length)) : '—'

    // Mechanisms
    const mechCounts: Record<string, number> = {}
    rows.forEach(p => {
      const m = (p.data.injury_mechanism as string) || 'other'
      mechCounts[m] = (mechCounts[m] || 0) + 1
    })
    const topMechanisms = Object.entries(mechCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({
        name: name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        count,
        pct: total > 0 ? ((count / total) * 100).toFixed(0) : '0',
      }))

    // ISS breakdown
    const issBreak = { minor: 0, moderate: 0, severe: 0, critical: 0 }
    rows.forEach(p => {
      const c = p.data.iss_category as string
      if (c in issBreak) issBreak[c as keyof typeof issBreak]++
    })
    const issBreakdown = [
      { label: 'Minor (ISS 1–8)', count: issBreak.minor },
      { label: 'Moderate (ISS 9–15)', count: issBreak.moderate },
      { label: 'Severe (ISS 16–24)', count: issBreak.severe },
      { label: 'Critical (ISS ≥25)', count: issBreak.critical },
    ].filter(i => i.count > 0)

    const sections = config.report_sections?.length
      ? config.report_sections
      : ['summary', 'mortality', 'avgs', 'mechanisms', 'iss', 'completeness']

    // Completeness: fetch ALL non-draft patients (not just this week) for global completeness
    const COMPLETENESS_FIELDS: { key: string; label: string }[] = [
      { key: 'admission_date', label: 'Admission Date' },
      { key: 'patient_age', label: 'Age' },
      { key: 'patient_sex', label: 'Sex' },
      { key: 'injury_mechanism', label: 'Injury Mechanism' },
      { key: 'injury_date', label: 'Injury Date' },
      { key: 'arrival_gcs_total', label: 'GCS Total' },
      { key: 'iss_score', label: 'ISS Score' },
      { key: 'outcome', label: 'Outcome' },
      { key: 'los_days', label: 'Length of Stay' },
      { key: 'injury_lat', label: 'GPS Location' },
    ]
    let completenessRows: { label: string; pct: number }[] = []
    if (sections.includes('completeness')) {
      let allQuery = supabase.from('patients').select('data').neq('data->>record_status', 'draft')
      if (config.hospital_id) allQuery = allQuery.eq('data->>hospital_id', config.hospital_id)
      const { data: allPts } = await allQuery
      const allRows = (allPts ?? []) as PatientRow[]
      if (allRows.length > 0) {
        completenessRows = COMPLETENESS_FIELDS.map(({ key, label }) => {
          const filled = allRows.filter(p => {
            const v = p.data[key]
            return v !== null && v !== undefined && v !== ''
          }).length
          return { label, pct: Math.round((filled / allRows.length) * 100) }
        })
      }
    }

    const html = buildEmailHtml({
      weekLabel, total, deaths, mortalityPct, avgISS, avgLOS, avgResponse,
      topMechanisms, issBreakdown, hospitalId: config.hospital_id,
      sections, completenessRows,
    })

    // Send email
    const { error: sendErr } = await resend.emails.send({
      from: 'RESPOND Guatemala <reports@respond-guatemala.org>',
      to: config.recipient_emails,
      subject: `Weekly Trauma Report — ${weekLabel} (${total} patients)`,
      html,
    })

    if (sendErr) {
      results.push({ config_id: config.id, sent: 0, error: sendErr.message })
    } else {
      // Update last_sent_at
      await supabase.from('report_configs').update({ last_sent_at: now.toISOString() }).eq('id', config.id)
      results.push({ config_id: config.id, sent: config.recipient_emails.length })
    }
  }

  return NextResponse.json({ ok: true, results })
}
