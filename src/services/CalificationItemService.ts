import { QueryBuilder } from "objection";
import CalificationItem, { ICalificationItem } from "../model/CalificationItem";

export function updateOrCreate(
  caliData: ICalificationItem | ICalificationItem[]
): QueryBuilder<CalificationItem, CalificationItem> {
  return CalificationItem.query()
    .insert(caliData)
    .onConflict(["lesson_code", "register_code"])
    .merge()
    .returning("*");
}

export function removeC(
  lesson_code: number,
  register_code: string
): QueryBuilder<CalificationItem, number> {
  return CalificationItem.query()
    .where("lesson_code", lesson_code)
    .where("register_code", register_code)
    .delete();
}

export function removeAll(lesson_code: number): QueryBuilder<CalificationItem, number> {
  return CalificationItem.query().where("lesson_code", lesson_code).delete();
}
