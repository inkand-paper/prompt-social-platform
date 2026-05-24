import { supabase } from '../database/SupabaseClient';
import { ISaveRepository } from '../../core/repositories/ISaveRepository';
import { Save, CreateSaveInput, SavedPrompt } from '../../core/entities/Save';

export class SupabaseSaveRepository implements ISaveRepository {
  async create(data: CreateSaveInput): Promise<Save> {
    const { data: save, error } = await supabase
      .from('prompt_saves')
      .insert({
        user_id: data.user_id,
        prompt_id: data.prompt_id,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create save: ${error.message}`);
    
    return {
      id: save.prompt_id || save.id,
      user_id: save.user_id,
      prompt_id: (save as any).prompt_id,
      created_at: new Date(save.created_at),
    };
  }

  async delete(userId: string, promptId: string): Promise<void> {
    const { error } = await supabase
      .from('prompt_saves')
      .delete()
      .eq('user_id', userId)
      .eq('prompt_id', promptId);

    if (error) throw new Error(`Failed to delete save: ${error.message}`);
  }

  async hasSaved(userId: string, promptId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('prompt_saves')
      .select('id')
      .eq('user_id', userId)
      .eq('prompt_id', promptId)
      .maybeSingle();

    if (error) throw new Error(`Failed to check save: ${error.message}`);
    return !!data;
  }

  async getSavedPrompts(userId: string, limit: number = 20, offset: number = 0): Promise<SavedPrompt[]> {
    const { data, error } = await supabase
      .from('prompt_saves')
      .select(`
        id,
        created_at,
        prompts!inner (
          id,
          title,
          prompt_text
        )
      `)
      .eq('user_id', userId)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to get saved prompts: ${error.message}`);
    
    return data.map(save => {
      const p = save.prompts as any;
      return {
        id: (save as any).prompt_id || save.id,
        prompt_id: p?.id,
        title: p?.title,
        prompt_text: p?.prompt_text,
        saved_at: new Date(save.created_at),
      };
    });
  }

  async getSavesCount(promptId: string): Promise<number> {
    const { count, error } = await supabase
      .from('prompt_saves')
      .select('id', { count: 'exact', head: true })
      .eq('prompt_id', promptId);

    if (error) throw new Error(`Failed to get saves count: ${error.message}`);
    return count || 0;
  }

  async deleteByPromptId(promptId: string): Promise<void> {
    const { error } = await supabase
      .from('prompt_saves')
      .delete()
      .eq('prompt_id', promptId);

    if (error) throw new Error(`Failed to delete prompt saves: ${error.message}`);
  }
}