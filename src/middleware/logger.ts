import { NextFunction, Request, Response } from "express";
import logger from "../config/pino";

export default (req: Request, res: Response, next: NextFunction): void => {
  const dt = new Date().toLocaleString();
  const { method, path, body, statusCode } = req;
  const log = `[${dt}] ${method}:${path} (${statusCode}) ${JSON.stringify(body)}`;
  logger.info(log);
  next();
};
