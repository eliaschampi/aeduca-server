import Register from "../model/Register";
import { QueryBuilder } from "objection";
import { full } from "../decorators/Decorators";

export const fetchByIn = (codes: string[], section_code: string[]) => {
  return Register.query()
    .select("code")
    .whereIn("code", codes)
    .whereIn("section_code", section_code);
};

export const fetchActiveRegister = async (dni: string): Promise<Register | null> => {
  const value = (await Register.query().where("student_dni", dni).where("state", "a"))[0];
  if (value?.section_code) {
    value.stext = full(value.section_code);
    return value;
  }
  return null;
};

export function fetchBySection(section_code: string): QueryBuilder<Register, Register[]> {
  return Register.query()
    .select("code", "student_dni as dni", "person.name", "person.lastname")
    .joinRelated("person(onlyPerson)")
    .withGraphJoined("profile(onlyProfile)")
    .modifiers({
      onlyPerson(builder) {
        builder.select("name", "lastname");
      },
      onlyProfile(builder) {
        builder.select("image", "description", "last_logout");
      }
    })
    .where("section_code", section_code);
}

export function countBySection(
  section_code: string
): QueryBuilder<Register, Register | undefined> {
  return Register.query().where("section_code", "like", section_code).count().first();
}
