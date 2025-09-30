import { NextFunction, Request, Response } from "express";
import { opsDecorated } from "../decorators/CycleDecorator";
import { byCodeWithRelations, bySection, byTeacher } from "../services/OpService";

export const fetchByCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.params;
    if (!code) {
      res.status(400).json({ message: "codigo no proporcionado" });
      return;
    }
    const value = await byCodeWithRelations(+code);
    res.status(200).json({ value });
  } catch (error) {
    next(error);
  }
};

export const fetchBySection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { section_code } = req.params;
    if (!section_code) {
      res.status(400).json({ message: "seccion no proporcionada" });
      return;
    }
    const values = await bySection(section_code);
    res.status(200).json({ values });
  } catch (error) {
    next(error);
  }
};

export const fetchByTeacher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { teacher_dni } = req.params;
    if (!teacher_dni) {
      res.status(400).json({ message: "dni no proporcionado" });
      return;
    }
    const values = opsDecorated(await byTeacher(teacher_dni));
    res.status(200).json({ values });
  } catch (error) {
    next(error);
  }
};
