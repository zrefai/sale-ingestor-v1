import { Block } from './block';

export interface AlchemyGraphQLResponse {
  webhookId: string;
  id: string;
  createdAt: string;
  type: string;
  event: {
    sequenceNumber: string;
    data: {
      block: Block;
    };
  };
}
