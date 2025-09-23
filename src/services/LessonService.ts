import { QueryBuilder, PartialModelGraph } from "objection";
import Lesson from "../model/Lesson";
import { update as updateLesson } from "./ContentService";
import { update as updateActivity } from "./ActivityService";
import { IActivity } from "../model/Activity";
type LType = {
  code: number;
  content?: object;
  activity?: IActivity;
};

export function fetchByCode(
  code: number,
  graph: string
): QueryBuilder<Lesson, Lesson | undefined> {
  return Lesson.query().withGraphFetched(`[${graph}]`).findById(code);
}

export function fetchByOp(
  op_code: number,
  user: "docente" | "estudiante"
): QueryBuilder<Lesson, Lesson[]> {
  let query = Lesson.query().where("op_code", op_code).orderBy("created_at", "ASC");

  if (user === "estudiante") {
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
  if (lesson.content) {
    await updateLesson(code, lesson.content);
    return;
  }
  if (lesson.activity) {
    await updateActivity(code, lesson.activity);
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
