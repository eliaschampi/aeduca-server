import { Model } from "objection";
import Register from "./Register";

class Payment extends Model {
  static tableName = "payment";

  static get idColumn(): string {
    return "code";
  }

  static relationMappings = {
    register: {
      relation: Model.BelongsToOneRelation,
      modelClass: Register,
      join: {
        from: "payment.register_code",
        to: "register.code"
      }
    }
  };
}

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

export default Payment;
