import { Model } from "objection";

class Unit extends Model {
  static get tableName(): string {
    return "unit";
  }

  static get idColumn(): string {
    return "code";
  }
}

export type IUnit = {
  title: string;
  op_code: number;
  description: string;
  to_date: string;
};

export default Unit;
