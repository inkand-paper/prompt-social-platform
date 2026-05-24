export interface FeedItem {
  id: string;
  type: 'prompt';
  prompt_id: string;
  user_id: string;
  created_at: Date;
}

export interface FeedQuery {
  userId: string;
  limit?: number;
  offset?: number;
}

export interface FeedResponse {
  items: FeedItem[];
  hasMore: boolean;
  nextOffset: number;
}