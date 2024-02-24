import Op from "../model/Op";

export async function byCodeWithRelations(code: number): Promise<Op | undefined> {
  return await Op.query().withGraphFetched("[course, person]").findById(code);
}

export async function bySection(section_code: string): Promise<Op[]> {
  return await Op.query()
    .withGraphFetched("[course, person(personCustom)]")
    .modifiers({
      personCustom(builder) {
        builder.select("dni", "name", "lastname");
      }
    })
    .whereRaw(`'${section_code}|all' ~* any(sts)`);
}

export async function byTeacher(teacher_dni: string): Promise<Op[]> {
  return await Op.query().withGraphFetched("course").where("teacher_dni", teacher_dni);
}
