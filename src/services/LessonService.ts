import { QueryBuilder, PartialModelGraph } from "objection";
import Lesson from "../model/Lesson";
import { update as updateCali } from "./CalificationService";
import { update as updateLesson } from "./ContentService";
type LType = { code: number; calification?: object; content?: object };

export function fetchByCode(
  code: number,
  graph: string
): QueryBuilder<Lesson, Lesson | undefined> {
  return Lesson.query().withGraphFetched(`[${graph}]`).findById(code);
}

export function fetchByOp(op_code: number, user: "teacher" | "student"): QueryBuilder<Lesson, Lesson[]> {
  let query = Lesson.query()
    .where("op_code", op_code)
    .orderBy("created_at", "ASC");

  if (user !== "teacher") {
    query = query.where("visible", true);
  }

  return query;
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
