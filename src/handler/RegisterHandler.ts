import { NextFunction, Request, Response } from "express";
import * as service from "../services/RegisterService";

export const fetchBySection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { section_code } = req.params;
    const registers = await service.fetchBySection(section_code);
    const values = registers.map((item: any) => ({
      ...item,
      profile: item.profile || {},
      online: false
    }));
    return res.status(200).send({ values });
  } catch (error) {
    next(error);
  }
};

export const countBySection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const value = await service.countBySection(req.params.section_code);
    return res.status(200).send({ value });
  } catch (error) {
    next(error);
  }
};

export const fetchScoreReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const values = await service.fetchScoreReport(
      +req.params.lesson_code,
      req.params.section_code,
      +req.params.skip
    );
    return res.status(200).send({ values });
  } catch (error) {
    next(error);
  }
};
