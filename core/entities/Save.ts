export interface Save {
  id: string;
  user_id: string;
  prompt_id: string;
  created_at: Date;
}

export interface CreateSaveInput {
  user_id: string;
  prompt_id: string;
}

export interface SavedPrompt {
  id: string;
  prompt_id: string;
  title: string;
  prompt_text: string;
  saved_at: Date;
}