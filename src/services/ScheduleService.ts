import Schedule from "../model/Schedule";

export async function bySection(section_code: string): Promise<Schedule[]> {
  return await Schedule.query()
    .withGraphJoined("op.[course]")
    .whereRaw(`'${section_code}|all' ~* any(sts)`)
    .where("state", true);
}

export async function byTeacher(teacher_dni: string): Promise<Schedule[]> {
  return await Schedule.query()
    .withGraphJoined("op.[course]")
    .where("state", true)
    .where("op.teacher_dni", teacher_dni);
  //TODO: add year and branch column column to OP
}
