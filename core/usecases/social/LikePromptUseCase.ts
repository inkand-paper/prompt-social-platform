import { ILikeRepository } from '../../repositories/ILikeRepository';
import { IPromptRepository } from '../../repositories/IPromptRepository';
import { INotificationRepository } from '../../repositories/INotificationRepository';

export class LikePromptUseCase {
  constructor(
    private likeRepository: ILikeRepository,
    private promptRepository: IPromptRepository,
    private notificationRepository: INotificationRepository
  ) {}

  async execute(userId: string, promptId: string): Promise<{ liked: boolean; likeCount: number }> {
    const hasLiked = await this.likeRepository.hasLiked(userId, promptId);
    const currentLikes = await this.likeRepository.getLikesCount(promptId);
    
    if (hasLiked) {
      await this.likeRepository.delete(userId, promptId);
      return { liked: false, likeCount: currentLikes - 1 };
    } else {
      await this.likeRepository.create({ user_id: userId, prompt_id: promptId });
      
      const prompt = await this.promptRepository.findById(promptId);
      if (prompt && prompt.userId !== userId) {
        await this.notificationRepository.create({
          user_id: prompt.userId,
          actor_id: userId,
          type: 'like',
          prompt_id: promptId,
        });
      }
      
      return { liked: true, likeCount: currentLikes + 1 };
    }
  }
}