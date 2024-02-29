import { QueryBuilder } from "objection";
import Score, { IScore } from "../model/Score";

export function updateOrCreate(scoreData: IScore | IScore[]): QueryBuilder<Score, Score> {
  return Score.query()
    .insert(scoreData)
    .onConflict(["lesson_code", "register_code"])
    .merge()
    .returning("*");
}

export function removeScore(
  lesson_code: number,
  register_code: string
): QueryBuilder<Score, number> {
  return Score.query()
    .where("lesson_code", lesson_code)
    .where("register_code", register_code)
    .delete();
}
