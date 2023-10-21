import { NextFunction, Request, Response } from "express";
import * as ls from "../services/LessonService";
import { removeC } from "../services/ScoreService";
import { removeR } from "../services/ResponseService";

export const fetchByCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const value = await ls.fetchByCode(+req.params.code);
    return res.status(200).send({ value });
  } catch (error) {
    next(error);
  }
};

export const fecthCalificationByRegister = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const values = await ls.fecthCalificationByRegister(
      req.params.section_code,
      req.params.register_code
    );
    return res.status(200).send({ values });
  } catch (error) {
    next(error);
  }
};

export const fetchByOp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const values = await ls.fetchByOp(+req.params.op_code);
    return res.status(200).send({ values });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ls.update(req.body, +req.params.code, req.params.del_act === "true");
    return res.status(200).send({ message: "Correctamente actualizado" });
  } catch (error) {
    next(error);
  }
};

export const store = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ls.store(req.body);
    return res.status(200).send({ message: "Correctamente guardado" });
  } catch (error) {
    next(error);
  }
};

export const destroy = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ls.destroy(+req.params.code);
    return res.status(200).send({ message: "Correctamente eliminado" });
  } catch (error) {
    next(error);
  }
};

export const removeRActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { lesson_code, register_code } = req.params;
    await removeC(+lesson_code, register_code);
    await removeR(+lesson_code, register_code);
    return res.status(200).send({ message: "Correctamente eliminado" });
  } catch (error) {
    next(error);
  }
};
