import { IFollowRepository } from '../../repositories/IFollowRepository';
import { INotificationRepository } from '../../repositories/INotificationRepository';

export class FollowUserUseCase {
  constructor(
    private followRepository: IFollowRepository,
    private notificationRepository: INotificationRepository
  ) {}

  async execute(followerId: string, followingId: string): Promise<{ following: boolean; followersCount: number }> {
    if (followerId === followingId) {
      throw new Error('Cannot follow yourself');
    }

    const isFollowing = await this.followRepository.isFollowing(followerId, followingId);
    const currentFollowers = await this.followRepository.getFollowersCount(followingId);
    
    if (isFollowing) {
      await this.followRepository.delete(followerId, followingId);
      return { following: false, followersCount: currentFollowers - 1 };
    } else {
      await this.followRepository.create({ follower_id: followerId, following_id: followingId });
      
      await this.notificationRepository.create({ user_id: followingId,
        actor_id: followerId,
        type: 'follow',
      });
      
      return { following: true, followersCount: currentFollowers + 1 };
    }
  }
}