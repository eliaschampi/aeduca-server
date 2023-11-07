import { QueryBuilder } from "objection";
import Calification from "../model/Calification";

export function update(
  lesson_code: number,
  data: object
): QueryBuilder<Calification, Calification | undefined> {
  return Calification.query()
    .update({
      ...data
    })
    .findById(lesson_code);
}
