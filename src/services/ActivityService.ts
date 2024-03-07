import { QueryBuilder } from "objection";
import Activity, { IActivity } from "../model/Activity";

export function fetchBySection(
  section_code: string,
  register_code: string
): QueryBuilder<Activity, Activity[]> {
  return Activity.query()
    .select([
      "lesson.code",
      "lesson.title",
      "activity.start_date",
      "activity.end_activity",
      "op.teacher_dni",
      "course.name",
      "response.files"
    ])
    .join("lesson", "lesson.code", "activity.lesson_code")
    .join("op", "op.code", "lesson.op_code")
    .join("course", "course.code", "op.course_code")
    .leftJoin("response", function () {
      this.on("response.lesson_code", "lesson.code").andOnVal(
        "response.register_code",
        register_code
      );
    })
    .whereRaw(`'${section_code}' ~* any(op.sts)`)
    .orderBy("lesson.created_at", "DESC");
}

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
