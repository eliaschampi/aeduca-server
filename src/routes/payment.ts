import { Router } from "express";
import {
  fetchPaymentsByRegister,
  fetchIncomesByRegister
} from "../handler/PaymentHandler";

const router = Router();

// GET /payment/register/:register_code - Fetch manual payments by register
router.get("/register/:register_code", fetchPaymentsByRegister);

// GET /payment/incomes/:register_code - Fetch income records by register
router.get("/incomes/:register_code", fetchIncomesByRegister);

export default router;
