import { NextFunction, Response, Request } from "express";
import { fetchByLessonWithReg } from "../services/ScoreService";

export const fetchBySection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lesson_code, section_code, type, skip } = req.params;
    const values = await fetchByLessonWithReg(+lesson_code, section_code, type, +skip);
    return res.status(200).send({ values });
  } catch (error) {
    next(error);
  }
};
