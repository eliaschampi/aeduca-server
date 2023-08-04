import { NextFunction, Request, Response } from "express";
//eslint-disable-next-line
export default (req: Request, res: Response, next: NextFunction) => {
  if (req.path.indexOf("filedinary") !== -1) {
    next();
  } else {
    const isSecureApi = req.headers["im-secure-api"];
    if (!isSecureApi) {
      return res.sendStatus(404);
    }
    next();
  }
};
