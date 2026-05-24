import { supabase } from '../database/SupabaseClient';
import { ICommentRepository } from '../../core/repositories/ICommentRepository';
import { Comment, CreateCommentInput, UpdateCommentInput } from '../../core/entities/Comment';

export class SupabaseCommentRepository implements ICommentRepository {
  async create(data: CreateCommentInput): Promise<Comment> {
    const { data: comment, error } = await supabase
      .from('prompt_comments')
      .insert({
        user_id: data.user_id,
        prompt_id: data.prompt_id,
        parent_id: data.parent_id || null,
        content: data.content,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create comment: ${error.message}`);
    
    return {
      id: comment.id,
      user_id: comment.user_id,
      prompt_id: comment.prompt_id,
      parent_id: comment.parent_id,
      content: comment.content,
      like_count: comment.like_count,
      created_at: new Date(comment.created_at),
      updated_at: new Date(comment.updated_at),
    };
  }

  async findById(id: string): Promise<Comment | null> {
    const { data, error } = await supabase
      .from('prompt_comments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    
    return {
      id: data.id,
      user_id: data.user_id,
      prompt_id: data.prompt_id,
      parent_id: data.parent_id,
      content: data.content,
      like_count: data.like_count,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
    };
  }

  async findByPromptId(promptId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('prompt_comments')
      .select('*')
      .eq('prompt_id', promptId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(`Failed to get comments: ${error.message}`);
    
    return data.map(comment => ({
      id: comment.id,
      user_id: comment.user_id,
      prompt_id: comment.prompt_id,
      parent_id: comment.parent_id,
      content: comment.content,
      like_count: comment.like_count,
      created_at: new Date(comment.created_at),
      updated_at: new Date(comment.updated_at),
    }));
  }

  async getReplies(commentId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('prompt_comments')
      .select('*')
      .eq('parent_id', commentId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(`Failed to get replies: ${error.message}`);
    
    return data.map(comment => ({
      id: comment.id,
      user_id: comment.user_id,
      prompt_id: comment.prompt_id,
      parent_id: comment.parent_id,
      content: comment.content,
      like_count: comment.like_count,
      created_at: new Date(comment.created_at),
      updated_at: new Date(comment.updated_at),
    }));
  }

  async update(id: string, data: UpdateCommentInput, userId: string): Promise<Comment> {
    const { data: comment, error } = await supabase
      .from('prompt_comments')
      .update({ content: data.content, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update comment: ${error.message}`);
    
    return {
      id: comment.id,
      user_id: comment.user_id,
      prompt_id: comment.prompt_id,
      parent_id: comment.parent_id,
      content: comment.content,
      like_count: comment.like_count,
      created_at: new Date(comment.created_at),
      updated_at: new Date(comment.updated_at),
    };
  }

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('prompt_comments')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to delete comment: ${error.message}`);
  }

  async incrementLikeCount(id: string): Promise<void> {
    const { error } = await supabase.rpc('increment_comment_like_count', { comment_id: id });
    if (error) throw new Error(`Failed to increment like count: ${error.message}`);
  }

  async getCommentsCount(promptId: string): Promise<number> {
    const { count, error } = await supabase
      .from('prompt_comments')
      .select('id', { count: 'exact', head: true })
      .eq('prompt_id', promptId);

    if (error) throw new Error(`Failed to get comments count: ${error.message}`);
    return count || 0;
  }

  async deleteByPromptId(promptId: string): Promise<void> {
    const { error } = await supabase
      .from('prompt_comments')
      .delete()
      .eq('prompt_id', promptId);

    if (error) throw new Error(`Failed to delete prompt comments: ${error.message}`);
  }
}