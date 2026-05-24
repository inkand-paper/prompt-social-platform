import { Comment, CreateCommentInput, UpdateCommentInput } from '../entities/Comment';

export interface ICommentRepository {
  create(data: CreateCommentInput): Promise<Comment>;
  findById(id: string): Promise<Comment | null>;
  findByPromptId(promptId: string): Promise<Comment[]>;
  getReplies(commentId: string): Promise<Comment[]>;
  update(id: string, data: UpdateCommentInput, userId: string): Promise<Comment>;
  delete(id: string, userId: string): Promise<void>;
  incrementLikeCount(id: string): Promise<void>;
  getCommentsCount(promptId: string): Promise<number>;
  deleteByPromptId(promptId: string): Promise<void>;
}