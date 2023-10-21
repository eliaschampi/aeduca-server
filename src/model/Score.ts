import { Model } from "objection";

class Score extends Model {
  static get tableName(): string {
    return "score";
  }

  static get idColumn(): string[] {
    return ["lesson_code", "register_code", "lesson_type"];
  }
}

export type IScore = {
  lesson_code: number;
  register_code: string;
  lesson_type: string;
  score: string;
  obs?: string;
  keys?: string;
};

export default Score;
