import { QueryBuilder } from "objection";
import Calification from "../model/Calification";

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
