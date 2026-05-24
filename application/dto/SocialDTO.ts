export interface LikeDTO {
  promptId: string;
  liked: boolean;
  likeCount: number;
}

export interface CommentDTO {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  content: string;
  likeCount: number;
  createdAt: Date;
  replies?: CommentDTO[];
}

export interface FollowDTO {
  userId: string;
  following: boolean;
  followersCount: number;
  followingCount: number;
}

export interface SaveDTO {
  promptId: string;
  saved: boolean;
  saveCount: number;
}