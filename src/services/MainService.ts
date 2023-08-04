import { knex } from "../con/KnexConection";
import Student from "../model/Student";

export async function fetchSupport(from: string, type: string): Promise<any> {
  const values = await knex
    .select()
    .from("support")
    .where("from_dni", from)
    .where("type", type);
  if (values.length) {
    return values[0];
  }
}

//eslint-disable-next-line
export const saveSupport = async (support: any): Promise<number[]> => {
  return await knex("support").insert(support).onConflict("code").merge();
};

export const coursesBySpe = async (): Promise<any[]> => {
  return knex("course").select("name");
};

export async function branchByStudent(dni: string): Promise<Student | undefined> {
  return Student.query().findById(dni);
}
