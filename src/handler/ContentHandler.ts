import { NextFunction, Request, Response } from "express";
import * as ct from "../services/ContentService";

export const fetchByLesson = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const value = await ct.fetchByLesson(+req.params.lesson_code);
    return res.status(200).send({ value });
  } catch (error) {
    next(error);
  }
};
