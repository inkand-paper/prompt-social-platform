export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: Date;
}

export interface CreateFollowInput {
  follower_id: string;
  following_id: string;
}

export interface FollowStats {
  followers_count: number;
  following_count: number;
}