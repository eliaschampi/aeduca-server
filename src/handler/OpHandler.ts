import { NextFunction, Request, Response } from "express";
import { opsDecorated } from "../decorators/CycleDecorator";
import { byCodeWithRelations, bySection, byTeacher } from "../services/OpService";

export const fetchByCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.params;
    const value = await byCodeWithRelations(+code);
    return res.status(200).json({ value });
  } catch (error) {
    next(error);
  }
};

export const fetchBySection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { section_code } = req.params;
    const values = await bySection(section_code);
    return res.status(200).json({ values });
  } catch (error) {
    next(error);
  }
};

export const fetchByTeacher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { teacher_dni } = req.params;
    const values = opsDecorated(await byTeacher(teacher_dni));
    return res.status(200).json({ values });
  } catch (error) {
    next(error);
  }
};
