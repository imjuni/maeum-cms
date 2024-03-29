import { cfg } from '#/configs/ConfigContainer';
import type { IReplyHealthDto } from '#/dto/common/IReplyHealthDto';
import { ApiErrorJsonSchema } from '@maeum/error-controller';
import { I18nController } from '@maeum/i18n-controller';
import type { FastifyRequest, RouteShorthandOptions } from 'fastify';

export const option: RouteShorthandOptions = {
  schema: {
    tags: ['Common'],
    summary: 'Server health check and configuration getting',
    operationId: 'get-server-health',
    response: {
      200: { $ref: 'IReplyHealthDto' },
      400: ApiErrorJsonSchema,
      500: ApiErrorJsonSchema,
    },
  },
};

export default async function healthHandler(req: FastifyRequest) {
  const language = I18nController.it.getLanguageFromRequestHeader(req.headers['accept-language']);

  return {
    envMode: cfg().server.envMode,
    runMode: cfg().server.runMode,
    port: cfg().server.port,
    i18n: { language },
  } satisfies IReplyHealthDto;
}
