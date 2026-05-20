import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, institution, country, role, center_type, volume, interest, message, locale } = body;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Open Trauma Registry <onboarding@resend.dev>",
      to: ["respondtraumaregistry@gmail.com"],
      subject: `[Open Trauma Registry] New pilot request — ${name} · ${institution}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#111827;padding:24px 32px;border-radius:8px 8px 0 0;">
            <p style="margin:0;color:#f87171;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Open Trauma Registry</p>
            <h1 style="margin:8px 0 0;color:#fff;font-size:20px;font-weight:700;">New pilot request</h1>
          </div>
          <div style="background:#fff;padding:24px 32px;border:1px solid #e5e7eb;border-top:none;">
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr><td style="padding:8px 0;color:#6b7280;width:140px;">Name</td><td style="padding:8px 0;font-weight:600;color:#111827;">${name}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;">Email</td><td style="padding:8px 0;"><a href="mailto:${email}" style="color:#dc2626;">${email}</a></td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;">Institution</td><td style="padding:8px 0;">${institution || "—"}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;">Country</td><td style="padding:8px 0;">${country || "—"}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;">Role</td><td style="padding:8px 0;">${role || "—"}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;">Center type</td><td style="padding:8px 0;">${center_type || "—"}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;">Monthly volume</td><td style="padding:8px 0;">${volume || "—"}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;">Interest</td><td style="padding:8px 0;">${interest || "—"}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;">Language</td><td style="padding:8px 0;">${locale === "es" ? "Spanish" : "English"}</td></tr>
            </table>
            ${message ? `
            <div style="margin-top:16px;padding:16px;background:#f9fafb;border-radius:6px;border-left:4px solid #dc2626;">
              <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Message</p>
              <p style="margin:0;font-size:14px;color:#374151;white-space:pre-wrap;">${message}</p>
            </div>` : ""}
          </div>
          <div style="background:#f9fafb;padding:12px 32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">Submitted via opentraumaregistry.org · ${new Date().toUTCString()}</p>
          </div>
        </div>
      `,
    });
  } catch {
    // Silent fail — form shows success regardless
  }

  return NextResponse.json({ ok: true });
}
