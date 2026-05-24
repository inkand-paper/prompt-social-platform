import { supabase } from '../database/SupabaseClient';
import { IFeedRepository } from '../../core/repositories/IFeedRepository';
import { FeedItem, FeedQuery, FeedResponse } from '../../core/entities/Feed';

export class SupabaseFeedRepository implements IFeedRepository {
  async getFeed(query: FeedQuery): Promise<FeedResponse> {
    const { userId, limit = 20, offset = 0 } = query;
    
    // First get the users that the current user follows
    const { data: following, error: followError } = await supabase
      .from('user_follows')
      .select('following_id')
      .eq('follower_id', userId);

    if (followError) throw new Error(`Failed to get following: ${followError.message}`);
    
    const followingIds = following.map(f => f.following_id);
    
    if (followingIds.length === 0) {
      return { items: [], hasMore: false, nextOffset: offset };
    }
    
    // Get prompts from followed users
    const { data, error, count } = await supabase
      .from('prompts')
      .select('id, user_id, created_at', { count: 'exact' })
      .in('user_id', followingIds)
      .eq('is_draft', false)
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`Failed to get feed: ${error.message}`);
    
    const items: FeedItem[] = data.map(prompt => ({
      id: prompt.id,
      type: 'prompt',
      prompt_id: prompt.id,
      user_id: prompt.user_id,
      created_at: new Date(prompt.created_at),
    }));
    
    return {
      items,
      hasMore: (count || 0) > offset + limit,
      nextOffset: offset + limit,
    };
  }

  async addToFeed(promptId: string, userId: string): Promise<void> {
    // This is handled by the prompts table directly
    // No separate feed table needed
  }

  async removeFromFeed(promptId: string, userId: string): Promise<void> {
    // This is handled by the prompts table directly
  }

  async getTrendingPrompts(limit: number = 10): Promise<FeedItem[]> {
    const { data, error } = await supabase
      .from('prompts')
      .select('id, user_id, created_at')
      .eq('is_draft', false)
      .eq('visibility', 'public')
      .order('view_count', { ascending: false })
      .order('like_count', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to get trending prompts: ${error.message}`);
    
    return data.map(prompt => ({
      id: prompt.id,
      type: 'prompt',
      prompt_id: prompt.id,
      user_id: prompt.user_id,
      created_at: new Date(prompt.created_at),
    }));
  }
}