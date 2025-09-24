import { supabaseAdmin } from '@/lib/supabaseServer'

function csvEscape(value: string): string {
  if (value.includes('"') || value.includes(',') || value.includes('\n') || value.includes('\r')) {
    return '"' + value.replace(/"/g, '""') + '"'
  }
  return value
}

export async function GET(req: Request) {
  try {
    if (!supabaseAdmin) {
      return new Response('Supabase not configured', { status: 500 })
    }

    const url = new URL(req.url)
    const format = (url.searchParams.get('format') || 'csv').toLowerCase()

    // Minimal protection: require ADMIN_EXPORT_TOKEN in header or query
    const provided = req.headers.get('x-admin-token') || url.searchParams.get('token') || ''
    const required = process.env.ADMIN_EXPORT_TOKEN || ''
    // If not configured in production, act like the route doesn't exist
    if (!required && process.env.NODE_ENV === 'production') {
      return new Response('Not Found', { status: 404 })
    }
    if (required && provided !== required) {
      return new Response('Forbidden', { status: 403 })
    }

    const limitParam = url.searchParams.get('limit')
    const limit = Math.min(Math.max(Number(limitParam || 10000), 1), 50000)

    const { data, error } = await supabaseAdmin
      .from('leads')
      .select('email,email_hash,wallet,source,created_at')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      return new Response(error.message, { status: 500 })
    }

    const rows = data || []
    if (format === 'json') {
      return new Response(JSON.stringify(rows), { headers: { 'content-type': 'application/json' } })
    }

    const headers = ['email', 'email_hash', 'wallet', 'source', 'created_at']
    const lines = [headers.join(',')]
    for (const r of rows as Array<Record<string, unknown>>) {
      const vals = [
        String(r.email ?? ''),
        String(r.email_hash ?? ''),
        String(r.wallet ?? ''),
        String(r.source ?? ''),
        String(r.created_at ?? ''),
      ]
      lines.push(vals.map(csvEscape).join(','))
    }
    const body = lines.join('\r\n')

    const ts = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)
    return new Response(body, {
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': `attachment; filename="leads-${ts}.csv"`,
      },
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Export failed'
    return new Response(msg, { status: 500 })
  }
}
