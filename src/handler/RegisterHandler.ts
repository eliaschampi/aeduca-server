import { NextFunction, Request, Response } from "express";
import { bySection, countBySection } from "../services/RegisterService";

export const fetchBySection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { section_code } = req.params;
    const registers = await bySection(section_code);
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

export const fetchCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const value = await countBySection(req.params.section_code);
    return res.status(200).send({ value });
  } catch (error) {
    next(error);
  }
};
