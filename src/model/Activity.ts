import { Model } from "objection";
import Lesson from "./Lesson";

class Activity extends Model {
  static get tableName(): string {
    return "activity";
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
          from: "activity.lesson_code",
          to: "lesson.code"
        }
      }
    };
  }
}

export type IActivity = {
  lesson_code: number;
  start_date: Date;
  end_activity: Date;
};

export default Activity;
