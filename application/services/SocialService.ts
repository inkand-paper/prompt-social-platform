import { LikePromptUseCase } from '../../core/usecases/social/LikePromptUseCase';
import { CommentOnPromptUseCase } from '../../core/usecases/social/CommentOnPromptUseCase';
import { FollowUserUseCase } from '../../core/usecases/social/FollowUserUseCase';
import { SavePromptUseCase } from '../../core/usecases/social/SavePromptUseCase';
import { GetFeedUseCase } from '../../core/usecases/social/GetFeedUseCase';
import { GetNotificationsUseCase } from '../../core/usecases/social/GetNotificationUseCase';
import { ICommentRepository } from '../../core/repositories/ICommentRepository';
import { IUserRepository } from '../../core/repositories/IUserRepository';

export class SocialService {
  constructor(
    public likePrompt: LikePromptUseCase,
    public commentOnPrompt: CommentOnPromptUseCase,
    public followUser: FollowUserUseCase,
    public savePrompt: SavePromptUseCase,
    public getFeed: GetFeedUseCase,
    public getNotifications: GetNotificationsUseCase,
    private commentRepository: ICommentRepository,
    private userRepository: IUserRepository
  ) {}

  async getComments(promptId: string) {
    const comments = await this.commentRepository.findByPromptId(promptId);
    
    // Enrich with user data
    const enrichedComments = await Promise.all(
      comments.map(async (comment: any) => {
        const user = await this.userRepository.findById(comment.user_id || comment.userId);
        return {
          ...comment,
          user: user ? {
            username: user.username,
            avatarUrl: user.avatarUrl,
            fullName: user.fullName
          } : undefined
        };
      })
    );
    
    return { success: true, data: enrichedComments };
  }
}