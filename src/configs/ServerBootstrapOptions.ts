import routeMap from '#/handlers/route-map';
import type { IErrorControllerOption } from '@maeum/error-controller';
import { pt, ptu, type I18nControllerOption } from '@maeum/i18n-controller';
import { getRoutePathKey, type IWinstonLoggingControllerOption } from '@maeum/logging-controller';
import type { ISchemaControllerBootstrapOption } from '@maeum/schema-controller';
import { getCwd } from '@maeum/tools';
import ajvFormat from 'ajv-formats';
import path from 'node:path';

export const ServerBootstrapOptions = {
  schema: {
    filePath: path.join(getCwd(process.env), 'resources', 'configs', 'store.json'),
    ajv: {
      options: {
        coerceTypes: 'array',
        keywords: ['collectionFormat', 'example', 'binary'],
        formats: {
          binary: { type: 'string', validate: () => true },
          byte: { type: 'string', validate: () => true },
          int64: { type: 'number', validate: () => true },
        },
      },
      extension: (ajv) => {
        ajvFormat(ajv);
      },
    },
    stringify: {
      useAjv: true,
      useNative: true,
    },
  } satisfies ISchemaControllerBootstrapOption,
  i18n: {
    localeRoot: path.join(getCwd(process.env), 'resources', 'locales'),
    defaultLanguage: 'en',
  } satisfies I18nControllerOption,
  logger: {
    request: {
      isReplyPayloadLogging: true,
      includes: new Map<string, boolean>(
        Array.from(routeMap.values())
          .map((routeInfo) => Array.from(routeInfo.values()))
          .flat()
          .map((routeInfo) => [getRoutePathKey(routeInfo), true]),
      ),
    },
  } satisfies IWinstonLoggingControllerOption,
  errors: {
    translate: (req, option) => ptu(req, option),
    fallbackMessage: (req) => pt(req, 'common.main.error'),
  } satisfies IErrorControllerOption,
};
