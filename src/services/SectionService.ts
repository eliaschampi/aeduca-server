import { QueryBuilder } from "objection";
import Section from "../model/Section";

export const byTeacher = (teacher_dni: string): QueryBuilder<Section, Section[]> => {
  return Section.query().whereExists(function () {
    this.select("*")
      .from("op")
      .whereRaw("section.code = any(op.sts) and op.teacher_dni = ?", [teacher_dni]);
  });
};
