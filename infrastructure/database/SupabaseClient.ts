import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Add these types after existing code
export type SocialTables = {
  prompt_likes: {
    id: string;
    user_id: string;
    prompt_id: string;
    created_at: string;
  };
  prompt_comments: {
    id: string;
    user_id: string;
    prompt_id: string;
    parent_id: string | null;
    content: string;
    like_count: number;
    created_at: string;
    updated_at: string;
  };
  user_follows: {
    id: string;
    follower_id: string;
    following_id: string;
    created_at: string;
  };
  prompt_saves: {
    id: string;
    user_id: string;
    prompt_id: string;
    created_at: string;
  };
  notifications: {
    id: string;
    user_id: string;
    actor_id: string;
    type: 'like' | 'comment' | 'reply' | 'follow' | 'save';
    prompt_id: string | null;
    comment_id: string | null;
    read: boolean;
    metadata: any;
    created_at: string;
  };
};