import { FeedItem, FeedQuery, FeedResponse } from '../entities/Feed';

export interface IFeedRepository {
  getFeed(query: FeedQuery): Promise<FeedResponse>;
  addToFeed(promptId: string, userId: string): Promise<void>;
  removeFromFeed(promptId: string, userId: string): Promise<void>;
  getTrendingPrompts(limit?: number): Promise<FeedItem[]>;
}