import { supabaseAdmin } from '@/lib/supabaseServer'
import crypto, { createCipheriv, randomBytes } from 'crypto'
import { getAddress, isAddress } from 'viem'

type LeadBody = {
  email?: string
  wallet?: string
  source?: string
}

function normalizeEmail(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const v = value.trim().toLowerCase()
  // Basic sanity check; allow most emails, but avoid junk
  const re = /.+@.+\..+/
  return re.test(v) ? v : undefined
}

function checksumWallet(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  try {
    const trimmed = value.trim()
    if (!isAddress(trimmed)) return undefined
    return getAddress(trimmed)
  } catch {
    return undefined
  }
}

async function verifyRecaptcha(token: string | undefined, ip: string | undefined) {
  const secret = process.env.RECAPTCHA_SECRET
  if (!secret || !token) return true
  try {
    const params = new URLSearchParams({ secret, response: token })
    if (ip) params.set('remoteip', ip)
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
      next: { revalidate: 0 },
    })
    const json = await res.json() as { success?: boolean }
    return !!json.success
  } catch {
    return false
  }
}

function encryptEmailIfConfigured(email: string | undefined): string | undefined {
  if (!email) return undefined
  const b64 = process.env.LEADS_ENC_KEY
  if (!b64) return email // fallback to plaintext if no key (so UX still works)
  try {
    const key = Buffer.from(b64, 'base64')
    if (key.length !== 32) return email
    const iv = randomBytes(12)
    const cipher = createCipheriv('aes-256-gcm', key, iv)
    const ct = Buffer.concat([cipher.update(email, 'utf8'), cipher.final()])
    const tag = cipher.getAuthTag()
    // pack iv|tag|ct into a single base64; prefix with enc:
    const payload = Buffer.concat([iv, tag, ct]).toString('base64')
    return `enc:${payload}`
  } catch {
    return email
  }
}

export async function POST(req: Request) {
  if (!supabaseAdmin) {
    return new Response('Supabase not configured', { status: 500 })
  }

  let body: LeadBody & { captchaToken?: string }
  try {
    body = (await req.json()) as LeadBody
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  const email = normalizeEmail(body.email)
  const wallet = checksumWallet(body.wallet)
  const source = typeof body.source === 'string' ? body.source.slice(0, 64) : undefined

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const okCaptcha = await verifyRecaptcha(body.captchaToken, ip)
  if (!okCaptcha) {
    return new Response('Captcha verification failed', { status: 400 })
  }

  if (!email && !wallet) {
    return new Response('Missing email or wallet', { status: 400 })
  }

  const email_hash = email
    ? crypto.createHash('sha256').update(email).digest('hex')
    : undefined

  const payload: Record<string, unknown> = {
    ...(email ? { email: encryptEmailIfConfigured(email) } : {}),
    ...(email_hash ? { email_hash } : {}),
    ...(wallet ? { wallet } : {}),
    ...(source ? { source } : {}),
  }

  // Upsert preference: if wallet is provided, treat it as the unique key; otherwise email_hash
  const onConflict = wallet ? 'wallet' : 'email_hash'

  // Basic throttle: if record exists and was written very recently, short‑circuit
  if (wallet) {
    const { data } = await supabaseAdmin.from('leads').select('created_at').eq('wallet', wallet).maybeSingle()
    if (data && Date.now() - new Date(data.created_at as unknown as string).getTime() < 60_000) {
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } })
    }
  } else if (email_hash) {
    const { data } = await supabaseAdmin.from('leads').select('created_at').eq('email_hash', email_hash).maybeSingle()
    if (data && Date.now() - new Date(data.created_at as unknown as string).getTime() < 60_000) {
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } })
    }
  }

  const { error } = await supabaseAdmin
    .from('leads')
    .upsert(payload, { onConflict })

  if (error) {
    return new Response(error.message, { status: 500 })
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}
