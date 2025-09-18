import { NextFunction, Request, Response } from "express";
//eslint-disable-next-line
export default (req: Request, res: Response, next: NextFunction) => {
  next();
};
