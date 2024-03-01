import { NextFunction, Request, Response } from "express";
import * as rh from "../services/ResponseService";
import { byCodeIn } from "../services/FileService";

export const fetchByLessonAndSection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { lesson_code, section_code } = req.params;
    const values = await rh.fetchByLessonAndSection(+lesson_code, section_code);
    return res.status(200).send({ values });
  } catch (error) {
    next(error);
  }
};

export const fetchByRegister = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { lesson_code, register_code } = req.params;
    const value: any = await rh.fetchByRegister(+lesson_code, register_code);
    if (value && value.files) {
      const files = await byCodeIn(value.files);
      value.files = files;
    }
    return res.status(200).send({ value });
  } catch (error) {
    next(error);
  }
};

export const sendActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await rh.sendActivity(req.body);
    return res.status(200).send({ message: "Correctamente enviado" });
  } catch (error) {
    next(error);
  }
};

export const toggleReceived = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await rh.toggleReceived(+req.params.lesson_code, req.params.register_code);
    return res.status(200).send({ message: "Una actividad ha sido revisado" });
  } catch (error) {
    next(error);
  }
};
