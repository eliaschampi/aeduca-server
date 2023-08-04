import { Model } from "objection";

class CalificationItem extends Model {
  static get tableName(): string {
    return "calification_item";
  }

  static get idColumn(): string[] {
    return ["lesson_code", "register_code"];
  }
}

export type ICalificationItem = {
  lesson_code: number;
  register_code: string;
  score: string;
  obs?: string;
  keys?: string;
};

export default CalificationItem;
