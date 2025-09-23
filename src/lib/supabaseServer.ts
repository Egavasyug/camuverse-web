import { createClient } from '@supabase/supabase-js'

// Server-only Supabase admin client (uses service role; never expose to browser)
const url = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE

if (!url || !serviceKey) {
  console.warn('Supabase env vars missing: SUPABASE_URL or SUPABASE_SERVICE_ROLE')
}

export const supabaseAdmin = url && serviceKey
  ? createClient(url, serviceKey, { auth: { persistSession: false } })
  : null

