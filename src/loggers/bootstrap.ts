import getRunMode from '#configs/modules/getRunMode';
import { ILogFormat } from '#loggers/interface/ILogFormat';
import ll from '#loggers/ll';
import dayjs from 'dayjs';
import fs from 'fs';
import httpStatusCodes from 'http-status-codes';
import inspector from 'inspector';
import { isError } from 'my-easy-fp';
import { existsSync } from 'my-node-fp';
import path from 'path';
import { pino } from 'pino';

let logger: pino.Logger;

function getLogLevel(level?: string): pino.LevelWithSilent {
  if (
    level === 'fatal' ||
    level === 'error' ||
    level === 'warn' ||
    level === 'info' ||
    level === 'debug' ||
    level === 'trace' ||
    level === 'silent'
  ) {
    return level;
  }

  return 'info';
}

export function getSafeTimestamp(literal: unknown): string {
  try {
    if (typeof literal !== 'string') {
      throw new Error('invalid timestamp string');
    }

    return dayjs(literal).format('HH:mm:ss.SSS');
  } catch {
    return dayjs().format('HH:mm:ss.SSS');
  }
}

export function bootstrap() {
  const runMode = getRunMode();
  const level = getLogLevel(process.env.ENV_APP_LOG_LEVEL);

  if (runMode === 'local' && !existsSync(path.join(process.cwd(), 'logs'))) {
    fs.mkdirSync(path.join(process.cwd(), 'logs'), { recursive: true });
  }

  const applogFilename = existsSync('/var/log/nodejs')
    ? '/var/log/nodejs/nodejs.log'
    : path.join(process.cwd(), 'logs', 'app.log');

  if (inspector.url() == null) {
    logger = pino(
      pino.transport({
        targets: [
          {
            target: 'pino/file',
            level,
            options: {
              destination: applogFilename,
            },
          },
        ],
      }),
    );
  } else {
    logger = pino(pino.destination(applogFilename));
  }
}

function logging(fullname: string) {
  const filename = path.basename(fullname, '.ts');
  const debugLogger = ll(filename);

  const doLogging = (loggerMethod: pino.LogFn, content: Partial<ILogFormat>) => {
    try {
      const status = content.status ?? httpStatusCodes.OK;
      const reqMethod = content.req_method ?? 'SYS';

      const { err_msg, err_stk } =
        content.err != null
          ? { err_msg: content.err.message, err_stk: content.err.stack }
          : { err_msg: content.err_msg, err_stk: content.err_stk };

      loggerMethod({
        ...content,
        status,
        req_method: reqMethod,
        filename,
        err_msg,
        err_stk,
        body: content.body,
      });
    } catch (catched) {
      const err = isError(catched) ?? new Error(`unknown error raised from ${__filename}`);

      console.error(err.message); // eslint-disable-line
      console.error(err.stack); // eslint-disable-line
    }
  };

  return {
    fatal: (content: Partial<ILogFormat>) => doLogging(logger.fatal.bind(logger), content),
    error: (content: Partial<ILogFormat>) => doLogging(logger.error.bind(logger), content),
    warn: (content: Partial<ILogFormat>) => doLogging(logger.warn.bind(logger), content),
    info: (content: Partial<ILogFormat>) => doLogging(logger.info.bind(logger), content),
    debug: (content: Partial<ILogFormat>) => doLogging(logger.debug.bind(logger), content),
    silent: (content: Partial<ILogFormat>) => doLogging(logger.silent.bind(logger), content),
    trace: (...args: any[]) => {
      const [first, ...body] = args;
      debugLogger(first, ...body);
    },
  };
}

bootstrap();

export function getLogger() {
  return logger;
}

export default logging;
