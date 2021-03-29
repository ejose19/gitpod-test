import { StatusCodes } from "http-status-codes";
import { Context, Next } from "koa";
import winston from "winston";

interface Request {
  method: string;
  path: string;
  ip: string;
  headers?: any;
  body?: any;
}
interface Response {
  status: number;
  time: number;
  body?: any;
}

enum LogLevel {
  emerg = "emerg",
  alert = "alert",
  crit = "crit",
  error = "error",
  warning = "warning",
  notice = "notice",
  info = "info",
  debug = "debug",
}

interface LogEntry {
  level: LogLevel;
  message: {
    request: Request;
    response: Response;
    details?: any;
  };
}

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? LogLevel.info,
  levels: winston.config.syslog.levels,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

export function logging() {
  return async function (ctx: Context, next: Next) {
    const startDate = new Date();

    let error: any;
    try {
      await next();
    } catch (e) {
      error = e === undefined ? "Undefined Error" : e;

      ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
      ctx.body = { error: "Internal Error" };
    }

    const endDate = new Date();
    const durationMs = endDate.getTime() - startDate.getTime();

    if (error !== undefined) {
      ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
      ctx.body = { error: "Internal Error" };
    }

    const level: LogLevel =
      ctx.status >= 500 || error !== undefined
        ? LogLevel.error
        : ctx.status >= 400
        ? LogLevel.warning
        : LogLevel.info;

    const entry: LogEntry = {
      level,
      message: {
        request: {
          method: ctx.method,
          path: ctx.path,
          ip: ctx.ip,
        },
        response: {
          status: ctx.status,
          time: durationMs,
        },
        details: error,
      },
    };

    const { request: frq, response: frs } = entry.message;

    let formatted = "";
    formatted += `req: ${frq.method} ${frq.path} ${frq.ip}\n`;
    formatted += `${generatePadding(level)}res: ${frs.status} ${frs.time}ms`;

    logger.log(level, formatted);
  };
}

function generatePadding(level: LogLevel) {
  return " ".repeat(level.length + 2);
}
