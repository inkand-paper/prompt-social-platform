import { IFeedRepository } from '../../repositories/IFeedRepository';
import { IFollowRepository } from '../../repositories/IFollowRepository';
import { IPromptRepository } from '../../repositories/IPromptRepository';
import { IUserRepository } from '../../repositories/IUserRepository';

export class GetFeedUseCase {
  constructor(
    private feedRepository: IFeedRepository,
    private followRepository: IFollowRepository,
    private promptRepository: IPromptRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(userId: string, limit: number = 20, offset: number = 0) {
    const feed = await this.feedRepository.getFeed({ userId, limit, offset });
    
    const enrichedItems = await Promise.all(
      feed.items.map(async (item) => {
        const prompt = await this.promptRepository.findById(item.prompt_id);
        if (!prompt) return null;
        
        const author = await this.userRepository.findById((prompt as any).user_id || prompt.userId);
        const isLiked = await this.isPromptLikedByUser(userId, prompt.id);
        const isSaved = await this.isPromptSavedByUser(userId, prompt.id);
        
        return {
          id: item.id,
          type: item.type,
          prompt: {
            ...prompt,
            author: author ? {
              id: author.id,
              username: author.username,
              fullName: author.fullName,
              avatarUrl: author.avatarUrl,
            } : null,
            isLiked,
            isSaved,
          },
          createdAt: item.created_at,
        };
      })
    );
    
    return {
      items: enrichedItems.filter(item => item !== null),
      hasMore: feed.hasMore,
      nextOffset: feed.nextOffset,
    };
  }

  private async isPromptLikedByUser(userId: string, promptId: string): Promise<boolean> {
    // This would be injected or accessed via repository
    return false;
  }

  private async isPromptSavedByUser(userId: string, promptId: string): Promise<boolean> {
    return false;
  }
}