import { NextFunction, Response, Request } from "express";
import * as service from "../services/ScoreService";

export const updateOrCreate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const value = await service.updateOrCreate(req.body);
    return res.status(200).send({ message: "Correctamente actualizado", value });
  } catch (error) {
    next(error);
  }
};

export const removeScore = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lesson_code, register_code } = req.params;
    await service.removeScore(+lesson_code, register_code);
    return res.status(200).send({ message: "Correctamente eliminado" });
  } catch (error) {
    next(error);
  }
};
