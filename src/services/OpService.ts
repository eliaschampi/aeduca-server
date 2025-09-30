import Op from "../model/Op";

export function byCodeWithRelations(code: number) {
  return Op.query().withGraphFetched("[course, person]").findById(code);
}

export function bySection(section_code: string) {
  return Op.query()
    .withGraphFetched("[course, person(personCustom)]")
    .modifiers({
      personCustom(builder) {
        void builder.select("dni", "name", "lastname");
      }
    })
    .whereRaw(`'${section_code}|all' ~* any(sts)`);
}

export function byTeacher(teacher_dni: string) {
  return Op.query().withGraphFetched("course").where("teacher_dni", teacher_dni);
}
