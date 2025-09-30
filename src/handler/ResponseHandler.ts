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
    if (!lesson_code || !section_code) {
      res.status(400).json({ message: "Parámetros inválidos" });
      return;
    }
    const values = await rh.fetchByLessonAndSection(+lesson_code, section_code);
    res.status(200).json({ values });
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
    if (!lesson_code || !register_code) {
      res.status(400).json({ message: "Parámetros inválidos" });
      return;
    }
    const value = await rh.fetchByRegister(+lesson_code, register_code);
    if (value?.files) {
      const files = await byCodeIn(value.files.map((file) => file.code));
      value.files = files;
    }
    res.status(200).json({ value });
  } catch (error) {
    next(error);
  }
};

export const sendActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await rh.sendActivity(req.body);
    res.status(200).json({ message: "Correctamente enviado" });
  } catch (error) {
    next(error);
  }
};

export const toggleReceived = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.params.lesson_code || !req.params.register_code) {
      res.status(400).json({ message: "Parámetros inválidos" });
      return;
    }
    await rh.toggleReceived(+req.params.lesson_code, req.params.register_code);
    res.status(200).json({ message: "Una actividad ha sido revisado" });
  } catch (error) {
    next(error);
  }
};
