import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// Bez .env app i tak wstaje (UI działa). Auth/dane dadzą błąd sieci dopiero
// przy użyciu — to OK. Placeholder, bo createClient('') rzuca wyjątkiem.
if (!url || !anonKey) {
  console.warn(
    'Brak VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (.env) — auth i dane nie zadziałają.',
  )
}

export const supabase = createClient(
  url || 'http://localhost:54321',
  anonKey || 'public-anon-placeholder',
)
