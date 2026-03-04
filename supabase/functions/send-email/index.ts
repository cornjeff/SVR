import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_KEY = Deno.env.get('RESEND_API_KEY')!
const FROM = 'Spruce Valley Ranch <noreply@svrbreck.com>'
const PORTAL_URL = 'https://cornjeff.github.io/SVR/'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function formatHour(h: number) {
  if (h === 12) return '12 PM'
  return h < 12 ? `${h} AM` : `${h - 12} PM`
}

function bookingHtml(name: string, date: string, hour: number) {
  const [y, m, d] = date.split('-').map(Number)
  const dateLabel = new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f5f0e8;font-family:Georgia,serif;">
<div style="max-width:560px;margin:40px auto;background:#0d1b2a;border:1px solid #2a3d54;">
  <div style="padding:32px 40px;border-bottom:1px solid #2a3d54;">
    <div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#c9a84c;margin-bottom:6px;">Spruce Valley Ranch</div>
    <div style="font-size:22px;color:#f5f0e8;font-weight:normal;">Booking Confirmed</div>
  </div>
  <div style="padding:32px 40px;">
    <p style="color:#b8c4d0;font-size:15px;line-height:1.7;margin:0 0 24px;">Hi ${name},</p>
    <p style="color:#b8c4d0;font-size:15px;line-height:1.7;margin:0 0 24px;">Your Trap &amp; Skeet Range session is confirmed:</p>
    <div style="background:#162032;border:1px solid #2a3d54;padding:20px 24px;margin-bottom:24px;">
      <div style="color:#c9a84c;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:8px;">Reservation Details</div>
      <div style="color:#f5f0e8;font-size:16px;">${dateLabel}</div>
      <div style="color:#b8c4d0;font-size:14px;margin-top:4px;">${formatHour(hour)} &ndash; ${formatHour(hour + 1)}</div>
    </div>
    <p style="color:#b8c4d0;font-size:14px;line-height:1.7;margin:0 0 8px;">To cancel your reservation, log into the Homeowner Portal and select your booking.</p>
    <p style="margin:24px 0 0;"><a href="${PORTAL_URL}" style="background:#c9a84c;color:#0d1b2a;text-decoration:none;padding:10px 22px;font-size:13px;letter-spacing:0.08em;display:inline-block;">Visit the Portal</a></p>
    <p style="color:#6a7f94;font-size:12px;margin:28px 0 0;">Spruce Valley Ranch &middot; Blue River, Colorado</p>
  </div>
</div>
</body></html>`
}

function welcomeHtml(name: string, inviteLink: string) {
  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f5f0e8;font-family:Georgia,serif;">
<div style="max-width:560px;margin:40px auto;background:#0d1b2a;border:1px solid #2a3d54;">
  <div style="padding:32px 40px;border-bottom:1px solid #2a3d54;">
    <div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#c9a84c;margin-bottom:6px;">Spruce Valley Ranch</div>
    <div style="font-size:22px;color:#f5f0e8;font-weight:normal;">Welcome to SVR</div>
  </div>
  <div style="padding:32px 40px;">
    <p style="color:#b8c4d0;font-size:15px;line-height:1.7;margin:0 0 24px;">Welcome, ${name}.</p>
    <p style="color:#b8c4d0;font-size:15px;line-height:1.7;margin:0 0 24px;">Your access to the Spruce Valley Ranch Homeowner Portal has been set up. You can view community announcements, the directory, HOA documents, financials, and reserve time at the Trap &amp; Skeet Range.</p>
    <div style="background:#162032;border:1px solid #2a3d54;padding:20px 24px;margin-bottom:24px;">
      <div style="color:#c9a84c;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:14px;">Getting Started</div>
      <div style="margin-bottom:16px;">
        <div style="color:#6a7f94;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px;">Step 1 — Set your password</div>
        <div style="color:#b8c4d0;font-size:14px;line-height:1.6;margin-bottom:10px;">Click the button below to choose your password. This link expires in 24 hours.</div>
        <a href="${inviteLink}" style="background:#c9a84c;color:#0d1b2a;text-decoration:none;padding:10px 22px;font-size:13px;letter-spacing:0.08em;display:inline-block;">Set Your Password</a>
      </div>
      <div>
        <div style="color:#6a7f94;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px;">Step 2 — Sign in to the portal</div>
        <a href="${PORTAL_URL}" style="color:#c9a84c;font-size:14px;text-decoration:none;">${PORTAL_URL}</a>
      </div>
    </div>
    <p style="color:#b8c4d0;font-size:14px;line-height:1.7;margin:0;">Once your password is set, sign in at the portal with your email address and chosen password.</p>
    <p style="color:#6a7f94;font-size:12px;margin:28px 0 0;">Spruce Valley Ranch &middot; Blue River, Colorado</p>
  </div>
</div>
</body></html>`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const { type, to, name, date, hour, inviteLink } = await req.json()

    let payload: object

    if (type === 'booking') {
      payload = {
        from: FROM,
        to: [to],
        subject: 'Range Booking Confirmed — Spruce Valley Ranch',
        html: bookingHtml(name, date, hour),
      }
    } else if (type === 'welcome') {
      payload = {
        from: FROM,
        to: [to],
        subject: 'Welcome to Spruce Valley Ranch — Portal Access',
        html: welcomeHtml(name, inviteLink),
      }
    } else {
      return new Response(JSON.stringify({ error: 'unknown type' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await r.json()
    return new Response(JSON.stringify(data), {
      status: r.status,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }
})
