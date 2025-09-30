import { NextFunction, Request, Response } from "express";
import { remove, sharedEntities, store } from "../services/FileshareService";

export const fetchSharedEntities = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { file_code } = req.params;
    if (!file_code) {
      res.status(400).json({ message: "Código de archivo es requerido" });
      return;
    }
    const values = await sharedEntities(+file_code);
    res.status(200).json({ values });
  } catch (error) {
    next(error);
  }
};

export const storeFs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const value: any = await store(req.body);
    res.status(200).json({ message: "Se ha compartido con éxito", code: value.code });
  } catch (error) {
    next(error);
  }
};

export const removeFs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.params;
    if (!code) {
      res.status(400).json({ message: "codigo no proporcionado" });
      return;
    }
    await remove(+code);
    res.status(200).json({ message: "Correctamente actualizado" });
  } catch (error) {
    next(error);
  }
};
