import { Model } from "objection";

class Course extends Model {
  static get tableName(): string {
    return "course";
  }

  static get idColumn(): string {
    return "code";
  }
}

export default Course;
