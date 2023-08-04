import { Model } from "objection";

class Student extends Model {
  static get tableName(): string {
    return "student";
  }

  static get idColumn(): string {
    return "dni";
  }
}

export default Student;
