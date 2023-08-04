import { Model } from "objection";
import Lesson from "./Lesson";

class Test extends Model {
  static tableName = "test";

  static idColumn = "lesson_code";

  static get relationMappings(): any {
    return {
      lesson: {
        relation: Model.BelongsToOneRelation,
        modelClass: Lesson,
        join: {
          from: "test.lesson_code",
          to: "lesson.code"
        }
      }
    };
  }
}

export default Test;
