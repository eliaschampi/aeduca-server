import { Model } from "objection";
import Op from "./Op";

class Schedule extends Model {
  static get tableName(): string {
    return "schedule";
  }

  static get idColumn(): string {
    return "code";
  }

  static get relationMappings(): any {
    return {
      op: {
        relation: Model.BelongsToOneRelation,
        modelClass: Op,
        join: {
          from: "schedule.op_code",
          to: "op.code"
        }
      }
    };
  }
}

export default Schedule;
