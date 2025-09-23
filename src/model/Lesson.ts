import { Model } from "objection";
import Op from "./Op";
import Content from "./Content";
import Activity from "./Activity";

class Lesson extends Model {
  static tableName = "lesson";

  static get idColumn(): string {
    return "code";
  }

  static relationMappings = {
    op: {
      relation: Model.BelongsToOneRelation,
      modelClass: Op,
      join: {
        from: "lesson.op_code",
        to: "op.code"
      }
    },
    content: {
      relation: Model.HasOneRelation,
      modelClass: Content,
      join: {
        from: "lesson.code",
        to: "content.lesson_code"
      }
    },
    activity: {
      relation: Model.HasOneRelation,
      modelClass: Activity,
      join: {
        from: "lesson.code",
        to: "activity.lesson_code"
      }
    }
  };
}

export default Lesson;
