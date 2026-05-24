import { createBrowserClient } from '@supabase/ssr'

// Create a singleton instance
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Also export the creator function for consistency
export function createClient() {
  return supabase
}