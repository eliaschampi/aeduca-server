import { knex } from "../con/KnexConection";

export type PaymentRecord = {
  code: number;
  register_code: string;
  pcode: number;
  description: string | null;
  topay: string;
  paid: string | null;
  amount: number;
  payment_type: string | null;
};

export type IncomeRecord = {
  income_code: number;
  series: string | null;
  correlative: string;
  type: string;
  total_discount: number;
  total: number;
  state: boolean;
  created_at: string;
  updated_at: string;
  cash_code: string;
  details: Array<{
    detail_code: number;
    cashactiontype_code: number;
    cashactiontype_name: string;
    cashactiontype_mode: string;
    title: string | null;
    topay: number;
    discount: number;
    paid: number;
  }>;
};

/**
 * Fetches all manual payments for a specific register
 */
export const fetchPaymentsByRegister = async (
  registerCode: string
): Promise<PaymentRecord[]> => {
  return knex<PaymentRecord>("payment")
    .select(
      "code",
      "register_code",
      "pcode",
      "description",
      "topay",
      "paid",
      "amount",
      "payment_type"
    )
    .where("register_code", registerCode)
    .orderBy("topay", "desc");
};

/**
 * Fetches all income records with details for a specific register
 */
export const fetchIncomesByRegister = async (
  registerCode: string
): Promise<IncomeRecord[]> => {
  // First get the income records for this register
  const incomes = await knex("income as i")
    .select(
      "i.code as income_code",
      "i.series",
      "i.correlative",
      "i.type",
      "i.total_discount",
      "i.total",
      "i.state",
      "i.created_at",
      "i.updated_at",
      "i.cash_code"
    )
    .join("register_income as ri", "i.code", "ri.income_code")
    .where("ri.register_code", registerCode)
    .orderBy("i.created_at", "desc");

  if (incomes.length === 0) {
    return [];
  }

  // Get income codes for detail query
  const incomeCodes = incomes.map((income: any) => income.income_code);

  // Get all income details with cash action type info
  const details = await knex("income_detail as id")
    .select(
      "id.income_code",
      "id.code as detail_code",
      "id.cashactiontype_code",
      "cat.name as cashactiontype_name",
      "cat.mode as cashactiontype_mode",
      "id.title",
      "id.topay",
      "id.discount",
      "id.paid"
    )
    .join("cashactiontype as cat", "id.cashactiontype_code", "cat.code")
    .whereIn("id.income_code", incomeCodes)
    .orderBy("id.code");

  // Group details by income_code
  const detailsMap = details.reduce(
    (acc: any, detail: any) => {
      const { income_code, ...detailData } = detail;
      if (!acc[income_code]) {
        acc[income_code] = [];
      }
      acc[income_code].push(detailData);
      return acc;
    },
    {} as Record<number, any[]>
  );

  // Combine incomes with their details
  return incomes.map((income: any) => ({
    ...income,
    details: detailsMap[income.income_code] || []
  }));
};
