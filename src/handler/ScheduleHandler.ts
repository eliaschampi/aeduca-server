import { NextFunction, Request, Response } from "express";
import { shsDecorated } from "../decorators/CycleDecorator";
import { bySection, byTeacher } from "../services/ScheduleService";

export const fetchBySection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const values = await bySection(req.params.section_code);
    return res.status(200).send({ values });
  } catch (error) {
    next(error);
  }
};

export const fetchByTeacher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const values = shsDecorated(await byTeacher(req.params.teacher_dni));
    return res.status(200).send({ values });
  } catch (error) {
    next(error);
  }
};
