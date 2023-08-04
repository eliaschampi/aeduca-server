import { NextFunction, Request, Response } from "express";
import { myLessonFiles, remove, store } from "../services/LessonFileService";

export const fetchLessonFiles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const values = await myLessonFiles(+req.params.lesson_code);
    return res.status(200).send({ values });
  } catch (error) {
    next(error);
  }
};

export const storeLessonFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await store(req.body.lesson_code, req.body.file_code);
    return res.status(200).send({ message: "Correctamente actualizado" });
  } catch (error) {
    next(error);
  }
};

export const removeLessonFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await remove(+req.params.code);
    return res.status(200).send({ message: "Correctamente eliminado" });
  } catch (error) {
    next(error);
  }
};
