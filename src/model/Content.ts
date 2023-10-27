import { Model } from "objection";
import Lesson from "./Lesson";

class Content extends Model {
  static get tableName(): string {
    return "content";
  }

  static get idColumn(): string {
    return "lesson_code";
  }

  static get relationMappings(): any {
    return {
      lesson: {
        relation: Model.BelongsToOneRelation,
        modelClass: Lesson,
        join: {
          from: "content.lesson_code",
          to: "lesson.code"
        }
      }
    };
  }
}

export default Content;
