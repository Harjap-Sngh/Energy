import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  console.warn(
    '[GreenSync] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is unset. Configure .env.local.',
  )
}

export const supabase = createClient<Database>(url ?? '', anonKey ?? '')
