import { Router } from "express";
import {
  fetchPaymentsByRegister,
  fetchIncomesByRegister
} from "../handler/PaymentHandler";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// GET /payment/register/:register_code - Fetch manual payments by register
router.get("/register/:register_code", asyncHandler(fetchPaymentsByRegister));

// GET /payment/incomes/:register_code - Fetch income records by register
router.get("/incomes/:register_code", asyncHandler(fetchIncomesByRegister));

export default router;
