import { NextFunction, Request, Response } from "express";
import * as ct from "../services/ContentService";

export const fetchByLesson = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lesson_code } = req.params;
    if (!lesson_code) {
      res.status(400).json({ message: "Código de lección es requerido" });
      return;
    }
    const value = await ct.fetchByLesson(+lesson_code);
    res.status(200).json({ value });
  } catch (error) {
    next(error);
  }
};
