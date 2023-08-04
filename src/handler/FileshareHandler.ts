import { NextFunction, Request, Response } from "express";
import { remove, sharedEntities, store } from "../services/FileshareService";

export const fetchSharedEntities = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { file_code } = req.params;
    const values = await sharedEntities(+file_code);
    return res.status(200).send({ values });
  } catch (error) {
    next(error);
  }
};

export const storeFs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const value: any = await store(req.body);
    return res
      .status(200)
      .json({ message: "Se ha compartido con éxito", code: value.code });
  } catch (error) {
    next(error);
  }
};

export const removeFs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await remove(+req.params.code);
    return res.status(200).json({ message: "Correctamente actualizado" });
  } catch (error) {
    next(error);
  }
};
