import { Follow, CreateFollowInput, FollowStats } from '../entities/Follow';

export interface IFollowRepository {
  create(data: CreateFollowInput): Promise<Follow>;
  delete(followerId: string, followingId: string): Promise<void>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
  getFollowers(userId: string, limit?: number, offset?: number): Promise<Follow[]>;
  getFollowing(userId: string, limit?: number, offset?: number): Promise<Follow[]>;
  getFollowStats(userId: string): Promise<FollowStats>;
  getFollowersCount(userId: string): Promise<number>;
  getFollowingCount(userId: string): Promise<number>;
}