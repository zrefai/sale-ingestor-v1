import { AlchemyGraphQLResponse } from 'src/models/alchemy-graphql-response';
import { mapBlock } from './map-block';

export function mapAlchemyGraphQLResponse(body: any): AlchemyGraphQLResponse {
  return {
    webhookId: body.webhookId,
    id: body.id,
    createdAt: body.createdAt,
    type: body.type,
    event: {
      sequenceNumber: body.event.sequenceNumber,
      data: {
        block: mapBlock(body.event.data.block),
      },
    },
  };
}
