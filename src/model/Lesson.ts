import Unit from "./Unit";
import Test from "./Test";
import Activity from "./Activity";
import { Model } from "objection";
import LessonFlies from "./LessonFiles";
import Calification from "./Calification";
import CalificationItem from "./CalificationItem";

class Lesson extends Model {
  static tableName = "lesson";

  static get idColumn(): string {
    return "code";
  }

  static relationMappings = {
    unit: {
      relation: Model.BelongsToOneRelation,
      modelClass: Unit,
      join: {
        from: "lesson.unit_code",
        to: "unit.code"
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

    calification_items: {
      relation: Model.HasManyRelation,
      modelClass: CalificationItem,
      join: {
        from: "lesson.code",
        to: "calification_item.lesson_code"
      }
    }
  };
}

export type ILesson = {
  code?: number;
  unit_code: number;
  title: string;
  description: string;
  type: string;
  state: string;
  link: string;
  created_at?: string;
  updated_at?: string;
  calification?: any | null;
  activity?: any | null;
};

export default Lesson;
