import { Model } from "objection";

class Teacher extends Model {
  static get tableName(): string {
    return "teacher";
  }

  static get idColumn(): string {
    return "dni";
  }
}

export default Teacher;
