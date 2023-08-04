import { NextFunction, Request, Response } from "express";
import { BAD_REQUEST } from "../config/const";
import logger from "../config/pino";
//eslint-disable-next-line
export default (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message, err);

  return res.status(BAD_REQUEST).json({
    error: err.message
  });
};
