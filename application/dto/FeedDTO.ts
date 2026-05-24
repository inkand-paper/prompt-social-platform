import { PromptResponseDTO } from './PromptDTO';

export interface FeedItemDTO {
  id: string;
  type: 'prompt';
  prompt: PromptResponseDTO;
  createdAt: Date;
}

export interface FeedResponseDTO {
  items: FeedItemDTO[];
  hasMore: boolean;
  nextOffset: number;
}