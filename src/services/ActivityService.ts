import { QueryBuilder } from "objection";
import Activity from "../model/Activity";

export function create(
  lesson_code: number,
  activity: { start_date: string; end_activity: string }
): QueryBuilder<Activity, Activity> {
  return Activity.query().insert({
    lesson_code,
    ...activity
  });
}

export function update(
  lesson_code: number,
  start_date: string,
  end_activity: string
): QueryBuilder<Activity, number> {
  return Activity.query()
    .update({
      start_date,
      end_activity
    })
    .where("lesson_code", lesson_code);
}

export function destroy(lesson_code: number): QueryBuilder<Activity, number> {
  return Activity.query().deleteById(lesson_code);
}
