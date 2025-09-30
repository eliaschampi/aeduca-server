import { QueryBuilder } from "objection";
import Schedule from "../model/Schedule";

export function bySection(section_code: string): QueryBuilder<Schedule, Schedule[]> {
  return Schedule.query()
    .withGraphJoined("op.[course, person(personCustom)]")
    .modifiers({
      personCustom(builder) {
        void builder.select("dni", "name", "lastname");
      }
    })
    .whereRaw(`'${section_code}|all' ~* any(sts)`)
    .where("state", true);
}

export function byTeacher(teacher_dni: string): QueryBuilder<Schedule, Schedule[]> {
  return Schedule.query()
    .withGraphJoined("op.[course]")
    .where("state", true)
    .where("op.teacher_dni", teacher_dni);
}
