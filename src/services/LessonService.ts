import { QueryBuilder, PartialModelGraph } from "objection";
import Lesson from "../model/Lesson";
import { knex } from "../con/KnexConection";
import { update as updateCali } from "./CalificationService";
import { update as updateLesson } from "./ContentService";
type LType = { code: number; calification?: object; content?: object };

export function fetchByCode(
  code: number,
  graph: string
): QueryBuilder<Lesson, Lesson | undefined> {
  return Lesson.query().withGraphFetched(`[${graph}]`).findById(code);
}

export function fetchByOp(op_code: number): QueryBuilder<Lesson, Lesson[]> {
  return Lesson.query()
    .select(
      "lesson.*",
      knex.raw(
        "(select count(lesson_code) c from content where lesson.code = lesson_code)"
      ),
      knex.raw(
        "(select count(lesson_code) a from activity where lesson.code = lesson_code)"
      ),
      knex.raw("(select count(lesson_code) t from exam where lesson.code = lesson_code)")
    )
    .where("op_code", op_code)
    .orderBy("created_at", "ASC");
}

export async function update(lesson: LType, code: number): Promise<void> {
  await Lesson.query()
    .findById(code)
    .patch({
      ...lesson
    });
  if (lesson.calification) {
    await updateCali(code, lesson.calification);
  }
  if (lesson.content) {
    await updateLesson(code, lesson.content);
  }
}

export function store(lesson: object): QueryBuilder<Lesson, Lesson> {
  return Lesson.query()
    .insertGraph(<PartialModelGraph<Lesson>>lesson)
    .returning("code");
}

export function destroy(code: number): QueryBuilder<Lesson, number> {
  return Lesson.query().deleteById(code);
}
