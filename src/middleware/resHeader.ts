import { NextFunction, Request, Response } from "express";
export default (req: Request, res: Response, next: NextFunction): void => {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
};
