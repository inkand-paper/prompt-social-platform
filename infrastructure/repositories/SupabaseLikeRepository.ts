import { supabase } from '../database/SupabaseClient';
import { ILikeRepository } from '../../core/repositories/ILikeRepository';
import { Like, CreateLikeInput } from '../../core/entities/Like';

export class SupabaseLikeRepository implements ILikeRepository {
  async create(data: CreateLikeInput): Promise<Like> {
    const { data: like, error } = await supabase
      .from('prompt_likes')
      .insert({
        user_id: data.user_id,
        prompt_id: data.prompt_id,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create like: ${error.message}`);
    
    return {
      id: like.id,
      user_id: like.user_id,
      prompt_id: like.prompt_id,
      created_at: new Date(like.created_at),
    };
  }

  async delete(userId: string, promptId: string): Promise<void> {
    const { error } = await supabase
      .from('prompt_likes')
      .delete()
      .eq('user_id', userId)
      .eq('prompt_id', promptId);

    if (error) throw new Error(`Failed to delete like: ${error.message}`);
  }

  async hasLiked(userId: string, promptId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('prompt_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('prompt_id', promptId)
      .maybeSingle();

    if (error) throw new Error(`Failed to check like: ${error.message}`);
    return !!data;
  }

  async getLikesCount(promptId: string): Promise<number> {
    const { count, error } = await supabase
      .from('prompt_likes')
      .select('id', { count: 'exact', head: true })
      .eq('prompt_id', promptId);

    if (error) throw new Error(`Failed to get likes count: ${error.message}`);
    return count || 0;
  }

  async getUserLikes(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('prompt_likes')
      .select('prompt_id')
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to get user likes: ${error.message}`);
    return data.map(like => like.prompt_id);
  }

  async deleteByPromptId(promptId: string): Promise<void> {
    const { error } = await supabase
      .from('prompt_likes')
      .delete()
      .eq('prompt_id', promptId);

    if (error) throw new Error(`Failed to delete prompt likes: ${error.message}`);
  }
}