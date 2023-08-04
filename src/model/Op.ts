import { Model } from "objection";
import Course from "./Course";
import Person from "./Person";

class Op extends Model {
  static get tableName(): string {
    return "op";
  }

  static get idColumn(): string {
    return "code";
  }

  static get relationMappings(): any {
    return {
      course: {
        relation: Model.BelongsToOneRelation,
        modelClass: Course,
        join: {
          from: "op.course_code",
          to: "course.code"
        }
      },
      person: {
        relation: Model.BelongsToOneRelation,
        modelClass: Person,
        join: {
          from: "op.teacher_dni",
          to: "person.dni"
        }
      }
    };
  }
}

export default Op;
