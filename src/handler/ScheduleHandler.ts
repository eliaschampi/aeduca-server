import { NextFunction, Request, Response } from "express";
import { shsDecorated } from "../decorators/CycleDecorator";
import { bySection, byTeacher } from "../services/ScheduleService";

export const fetchBySection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { section_code } = req.params;
    if (!section_code) {
      return res.status(400).json({ error: "Código de sección es requerido" });
    }
    const values = await bySection(section_code);
    return res.status(200).json({ values });
  } catch (error) {
    next(error);
  }
};

export const fetchByTeacher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { teacher_dni } = req.params;
    if (!teacher_dni) {
      return res.status(400).json({ error: "Dni es requerido" });
    }
    const values = shsDecorated(await byTeacher(teacher_dni));
    return res.status(200).json({ values });
  } catch (error) {
    next(error);
  }
};
