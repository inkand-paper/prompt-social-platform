import { supabase } from '../database/SupabaseClient';
import { IFollowRepository } from '../../core/repositories/IFollowRepository';
import { Follow, CreateFollowInput, FollowStats } from '../../core/entities/Follow';

export class SupabaseFollowRepository implements IFollowRepository {
  async create(data: CreateFollowInput): Promise<Follow> {
    const { data: follow, error } = await supabase
      .from('user_follows')
      .insert({
        follower_id: data.follower_id,
        following_id: data.following_id,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create follow: ${error.message}`);
    
    return {
      id: follow.id,
      follower_id: follow.follower_id,
      following_id: follow.following_id,
      created_at: new Date(follow.created_at),
    };
  }

  async delete(followerId: string, followingId: string): Promise<void> {
    const { error } = await supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) throw new Error(`Failed to delete follow: ${error.message}`);
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();

    if (error) throw new Error(`Failed to check follow: ${error.message}`);
    return !!data;
  }

  async getFollowers(userId: string, limit: number = 20, offset: number = 0): Promise<Follow[]> {
    const { data, error } = await supabase
      .from('user_follows')
      .select('*')
      .eq('following_id', userId)
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`Failed to get followers: ${error.message}`);
    
    return data.map(follow => ({
      id: follow.id,
      follower_id: follow.follower_id,
      following_id: follow.following_id,
      created_at: new Date(follow.created_at),
    }));
  }

  async getFollowing(userId: string, limit: number = 20, offset: number = 0): Promise<Follow[]> {
    const { data, error } = await supabase
      .from('user_follows')
      .select('*')
      .eq('follower_id', userId)
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`Failed to get following: ${error.message}`);
    
    return data.map(follow => ({
      id: follow.id,
      follower_id: follow.follower_id,
      following_id: follow.following_id,
      created_at: new Date(follow.created_at),
    }));
  }

  async getFollowStats(userId: string): Promise<FollowStats> {
    const [followersCount, followingCount] = await Promise.all([
      this.getFollowersCount(userId),
      this.getFollowingCount(userId),
    ]);
    
    return {
      followers_count: followersCount,
      following_count: followingCount,
    };
  }

  async getFollowersCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('user_follows')
      .select('id', { count: 'exact', head: true })
      .eq('following_id', userId);

    if (error) throw new Error(`Failed to get followers count: ${error.message}`);
    return count || 0;
  }

  async getFollowingCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('user_follows')
      .select('id', { count: 'exact', head: true })
      .eq('follower_id', userId);

    if (error) throw new Error(`Failed to get following count: ${error.message}`);
    return count || 0;
  }
}