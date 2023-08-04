import { Model } from "objection";
import Lesson from "./Lesson";

class Calification extends Model {
  static get tableName(): string {
    return "calification";
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
          from: "calification.lesson_code",
          to: "lesson.code"
        }
      }
    };
  }
}

export type ICalification = {
  lesson_code: number;
  keys: string;
  uploaded_at?: string;
};

export default Calification;
