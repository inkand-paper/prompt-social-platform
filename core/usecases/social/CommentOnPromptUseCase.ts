import { ICommentRepository } from '../../repositories/ICommentRepository';
import { IPromptRepository } from '../../repositories/IPromptRepository';
import { INotificationRepository } from '../../repositories/INotificationRepository';
import { CreateCommentInput } from '../../entities/Comment';

export class CommentOnPromptUseCase {
  constructor(
    private commentRepository: ICommentRepository,
    private promptRepository: IPromptRepository,
    private notificationRepository: INotificationRepository
  ) {}

  async execute(userId: string, input: Omit<CreateCommentInput, 'userId'>) {
    if (!input.content.trim() || input.content.length > 2000) {
      throw new Error('Comment must be between 1 and 2000 characters');
    }

    const comment = await this.commentRepository.create({
      ...input, user_id: userId,
    });

    const prompt = await this.promptRepository.findById(input.prompt_id);
    
    if (prompt && prompt.userId !== userId) {
      await this.notificationRepository.create({
        user_id: prompt.userId,
        actor_id: userId,
        type: input.parent_id ? 'reply' : 'comment',
        prompt_id: input.prompt_id,
        comment_id: comment.id,
      });
    }

    if (input.parent_id) {
      const parentComment = await this.commentRepository.findById(input.parent_id);
      if (parentComment && parentComment.user_id !== userId && parentComment.user_id !== prompt?.userId) {
        await this.notificationRepository.create({
          user_id: parentComment.user_id,
          actor_id: userId,
          type: 'reply',
          prompt_id: input.prompt_id,
          comment_id: comment.id,
        });
      }
    }

    return comment;
  }
}