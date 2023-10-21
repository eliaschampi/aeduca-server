import Test from "./Test";
import Activity from "./Activity";
import { Model } from "objection";
import LessonFlies from "./LessonFiles";
import Calification from "./Calification";
import Score from "./Score";
import Op from "./Op";

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

    activity: {
      relation: Model.HasOneRelation,
      modelClass: Activity,
      join: {
        from: "lesson.code",
        to: "activity.lesson_code"
      }
    },

    calification: {
      relation: Model.HasOneRelation,
      modelClass: Calification,
      join: {
        from: "lesson.code",
        to: "calification.lesson_code"
      }
    },

    test: {
      relation: Model.HasOneRelation,
      modelClass: Test,
      join: {
        from: "lesson.code",
        to: "test.lesson_code"
      }
    },

    files: {
      relation: Model.HasManyRelation,
      modelClass: LessonFlies,
      join: {
        from: "lesson.code",
        to: "lesson_files.lesson_code"
      }
    },

    score: {
      relation: Model.HasManyRelation,
      modelClass: Score,
      join: {
        from: "lesson.code",
        to: "score.lesson_code"
      }
    }
  };
}

export type ILesson = {
  code?: number;
  op_code: number;
  title: string;
  has: string;
  lesson_type: string;
  created_at?: string;
  updated_at?: string;
  calification?: any | null;
  activity?: any | null;
};

export default Lesson;
