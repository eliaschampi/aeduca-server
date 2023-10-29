import { QueryBuilder, PartialModelGraph, ref } from "objection";
import Lesson from "../model/Lesson";
import Score from "../model/Score";

type LType = { has: string };

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

export async function update(lesson: LType, code: number): Promise<void> {
  await Lesson.query()
    .findById(code)
    .patch({
      ...lesson
    });
}

export function store(lesson: object): QueryBuilder<Lesson, Lesson> {
  return Lesson.query()
    .insertGraph(<PartialModelGraph<Lesson>>lesson)
    .returning("code");
}

export function destroy(code: number): QueryBuilder<Lesson, number> {
  return Lesson.query().deleteById(code);
}
