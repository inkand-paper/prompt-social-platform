export interface Like {
  id: string;
  user_id: string;
  prompt_id: string;
  created_at: Date;
}

export interface CreateLikeInput {
  user_id: string;
  prompt_id: string;
}