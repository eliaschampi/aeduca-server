import { NextFunction, Request, Response } from "express";
import * as paymentService from "../services/PaymentService";

/**
 * Fetches manual payments for a specific register
 */
export const fetchPaymentsByRegister = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { register_code } = req.params;
    
    if (!register_code) {
      res.status(400).json({ 
        error: "register_code parameter is required" 
      });
      return;
    }

    const payments = await paymentService.fetchPaymentsByRegister(register_code);
    
    res.status(200).json({
      success: true,
      data: payments,
      count: payments.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetches income records with details for a specific register
 */
export const fetchIncomesByRegister = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { register_code } = req.params;
    
    if (!register_code) {
      res.status(400).json({ 
        error: "register_code parameter is required" 
      });
      return;
    }

    const incomes = await paymentService.fetchIncomesByRegister(register_code);
    
    res.status(200).json({
      success: true,
      data: incomes,
      count: incomes.length
    });
  } catch (error) {
    next(error);
  }
};