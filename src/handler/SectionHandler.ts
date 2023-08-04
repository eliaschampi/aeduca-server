import { NextFunction, Request, Response } from "express";
import { sectionDeco } from "../decorators/Decorators";
import { byTeacher } from "../services/SectionService";

export const fetchByTeacher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { teacher_dni } = req.params;
    const values = sectionDeco(await byTeacher(teacher_dni));
    return res.status(200).send({ values });
  } catch (error) {
    next(error);
  }
};
