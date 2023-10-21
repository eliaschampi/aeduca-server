import { QueryBuilder, PartialModelGraph, ref } from "objection";
import Lesson, { ILesson } from "../model/Lesson";
import { update as updateCalification } from "./CalificationService";
import * as activity from "./ActivityService";
import Score from "../model/Score";

export function fetchByCode(code: number): QueryBuilder<Lesson, Lesson | undefined> {
  return Lesson.query().withGraphFetched("[calification, activity]").findById(code);
}

export function fecthCalificationByRegister(
  section_code: string,
  register_code: string
): QueryBuilder<Lesson, Lesson[]> {
  return Lesson.query()
    .alias("l")
    .select([
      "l.code",
      "c.name as course",
      "l.type",
      "l.title",
      "l.description",
      Score.query()
        .alias("ci")
        .select("score")
        .where("ci.lesson_code", ref("l.code"))
        .where("ci.register_code", register_code)
        .limit(1)
        .as("score")
    ])
    .join("op", "op.code", "u.op_code")
    .join("course as c", "c.code", "op.course_code")
    .whereRaw(`'${section_code}|all' ~* any(sts)`)
    .orderBy("l.created_at", "DESC");
}

export function fetchByOp(op_code: number): QueryBuilder<Lesson, Lesson[]> {
  return Lesson.query().where("op_code", op_code).orderBy("created_at", "DESC");
}

export async function update(lesson: ILesson, code: number, ad: boolean): Promise<void> {
  await Lesson.query()
    .findById(code)
    .patch({
      ...lesson
    });
  if (lesson.calification) {
    await updateCalification(code, { keys: lesson.calification.keys });
  } else {
    if (ad) {
      await activity.destroy(code);
    } else {
      if (typeof lesson.activity !== "undefined") {
        if (!lesson.activity.lesson_code) {
          await activity.create(code, lesson.activity);
        } else {
          await activity.update(
            code,
            lesson.activity.start_date,
            lesson.activity.end_activity
          );
        }
      }
    }
  }
}

export function store(lesson: ILesson): QueryBuilder<Lesson, Lesson> {
  return Lesson.query()
    .insertGraph(<PartialModelGraph<Lesson>>lesson)
    .returning("code");
}

export function destroy(code: number): QueryBuilder<Lesson, number> {
  return Lesson.query().deleteById(code);
}
