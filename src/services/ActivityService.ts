import { QueryBuilder } from "objection";
import Activity, { IActivity } from "../model/Activity";

export function update(
  lesson_code: number,
  activity: IActivity
): QueryBuilder<Activity, number> {
  return Activity.query()
    .update({
      ...activity
    })
    .where("lesson_code", lesson_code);
}
