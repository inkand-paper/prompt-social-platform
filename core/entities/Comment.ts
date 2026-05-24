export interface Comment {
  id: string;
  user_id: string;
  prompt_id: string;
  parent_id: string | null;
  content: string;
  like_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCommentInput {
  user_id: string;
  prompt_id: string;
  content: string;
  parent_id?: string;
}

export interface UpdateCommentInput {
  content: string;
}