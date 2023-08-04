import { NextFunction, Request, Response } from "express";
import { decorateUnit } from "../decorators/UnitDecorator";
import { byCode, byOp, current, destroy, store, update } from "../services/UnitService";

export const fetchByCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.params;
    const value = await byCode(+code);
    return res.status(200).json({ value });
  } catch (error) {
    next(error);
  }
};

export const fetchCurrent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { op_code } = req.params;
    const value = await current(+op_code);
    return res.status(200).json({ value });
  } catch (error) {
    next(error);
  }
};

export const fetchByOp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { op_code } = req.params;
    const values = decorateUnit(await byOp(+op_code));
    return res.status(200).json({ values });
  } catch (error) {
    next(error);
  }
};

export const storeUnit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const value = await store(req.body);
    return res.status(200).json({ message: "Correctamente Guardado", value });
  } catch (error) {
    next(error);
  }
};

export const updateUnit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.params;
    const unit = req.body;
    delete unit.code;
    await update(unit, +code);
    return res.status(200).json({ message: "Correctamente Actualizado" });
  } catch (error) {
    next(error);
  }
};

export const deleteUnit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await destroy(+req.params.code);
    return res.status(200).json({ message: "Correctamente Eliminado" });
  } catch (error) {
    next(error);
  }
};
