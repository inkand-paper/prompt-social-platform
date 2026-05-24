import { Like, CreateLikeInput } from '../entities/Like';

export interface ILikeRepository {
  create(data: CreateLikeInput): Promise<Like>;
  delete(userId: string, promptId: string): Promise<void>;
  hasLiked(userId: string, promptId: string): Promise<boolean>;
  getLikesCount(promptId: string): Promise<number>;
  getUserLikes(userId: string): Promise<string[]>;
  deleteByPromptId(promptId: string): Promise<void>;
}