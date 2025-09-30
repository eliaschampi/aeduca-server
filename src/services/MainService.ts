import { knex } from "../con/KnexConection";
import Student from "../model/Student";

export function fetchSupport(from: string, type: string) {
  return knex
    .select()
    .from("support")
    .where("from_dni", from)
    .where("type", type)
    .first();
}

//eslint-disable-next-line
export const saveSupport = (support: any) => {
  return knex("support").insert(support).onConflict("code").merge();
};

export const coursesBySpe = () => {
  return knex("course").select("name");
};

export function branchByStudent(dni: string) {
  return Student.query().findById(dni);
}
