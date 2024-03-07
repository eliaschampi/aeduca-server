import { QueryBuilder } from "objection";
import Calification from "../model/Calification";

export const fetchByRegister = (section_code: string, register_code: string) => {
  return Calification.query()
    .select([
      "calification.exam_day",
      "lesson.code",
      "lesson.title",
      "op.teacher_dni",
      "course.name",
      "score.score",
      "score.obs",
      "score.keys"
    ])
    .join("lesson", "lesson.code", "calification.lesson_code")
    .join("op", "op.code", "lesson.op_code")
    .join("course", "course.code", "op.course_code")
    .leftJoin("score", function () {
      this.on("score.lesson_code", "lesson.code").andOnVal(
        "score.register_code",
        register_code
      );
    })
    .whereRaw(`'${section_code}' ~* any(op.sts)`)
    .orderBy("lesson.created_at", "DESC");
};

export function update(
  lesson_code: number,
  data: object
): QueryBuilder<Calification, number> {
  return Calification.query()
    .findById(lesson_code)
    .patch({
      ...data
    });
}
