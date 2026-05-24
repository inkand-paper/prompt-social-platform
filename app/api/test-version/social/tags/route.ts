import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Unnest the tags array and count occurrences
    const { data, error } = await supabase.rpc('get_popular_tags', { tag_limit: 30 })

    if (error) {
      // Fallback: fetch raw tags if RPC not available
      const { data: prompts } = await supabase
        .from('prompts')
        .select('tags')
        .eq('is_draft', false)
        .eq('visibility', 'public')
        .not('tags', 'is', null)
        .limit(500)

      const tagCounts: Record<string, number> = {}
      ;(prompts || []).forEach((p: any) => {
        ;(p.tags || []).forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      })

      const popularTags = Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 30)
        .map(([tag, count]) => ({ tag, count }))

      return NextResponse.json({ success: true, tags: popularTags })
    }

    return NextResponse.json({ success: true, tags: data || [] })
  } catch (error) {
    console.error('Popular tags error:', error)
    return NextResponse.json({ success: false, tags: [] }, { status: 500 })
  }
}
