import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const form = await request.formData()
  const description = form.get('description') as string
  const userEmail = form.get('userEmail') as string | null
  const page = form.get('page') as string | null
  const screenshotFile = form.get('screenshot') as File | null

  if (!description?.trim()) {
    return NextResponse.json({ error: 'Description required' }, { status: 400 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  // Convert screenshot to base64 attachment if provided
  const attachments: { filename: string; content: Buffer }[] = []
  if (screenshotFile && screenshotFile.size > 0) {
    const bytes = await screenshotFile.arrayBuffer()
    attachments.push({
      filename: screenshotFile.name || 'screenshot.png',
      content: Buffer.from(bytes),
    })
  }

  const { error } = await resend.emails.send({
    from: 'RESPOND Registry <onboarding@resend.dev>',
    to: ['respondtraumaregistry@gmail.com'],
    subject: '[Bug Report] RESPOND Registry',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#1B3A6B;">Bug Report — RESPOND Registry</h2>
        <p><strong>Reported by:</strong> ${userEmail || 'Unknown'}</p>
        <p><strong>Page:</strong> ${page || 'Unknown'}</p>
        <p><strong>Description:</strong></p>
        <blockquote style="border-left:4px solid #1B3A6B;padding:12px;margin:8px 0;background:#f5f7fa;white-space:pre-wrap;">${description}</blockquote>
        ${attachments.length > 0 ? '<p style="color:#6b7280;font-size:13px;">📎 Screenshot attached</p>' : ''}
        <hr style="border:none;border-top:1px solid #e8ecf0;margin:16px 0;"/>
        <p style="font-size:12px;color:#9ca3af;">Sent automatically from RESPOND Guatemala Trauma Registry</p>
      </div>
    `,
    attachments,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
