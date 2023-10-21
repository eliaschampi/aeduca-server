import { QueryBuilder } from "objection";
import Score, { IScore } from "../model/Score";

export function updateOrCreate(caliData: IScore | IScore[]): QueryBuilder<Score, Score> {
  return Score.query()
    .insert(caliData)
    .onConflict(["lesson_code", "register_code"])
    .merge()
    .returning("*");
}

export function removeC(
  lesson_code: number,
  register_code: string
): QueryBuilder<Score, number> {
  return Score.query()
    .where("lesson_code", lesson_code)
    .where("register_code", register_code)
    .delete();
}

export function removeAll(lesson_code: number): QueryBuilder<Score, number> {
  return Score.query().where("lesson_code", lesson_code).delete();
}
