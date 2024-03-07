import { QueryBuilder } from "objection";
import Response, { IResponse } from "../model/Response";

export function fetchByLessonAndSection(
  lesson_code: number,
  section_code: string
): QueryBuilder<Response, Response[]> {
  return Response.query()
    .select([
      "person.dni",
      "person.name",
      "person.lastname",
      "register.code",
      "register.section_code",
      "response.files"
    ])
    .join("register", "response.register_code", "register.code")
    .join("person", "register.student_dni", "person.dni")
    .where("response.lesson_code", lesson_code)
    .andWhere("register.section_code", section_code)
    .orderBy("response.created_at", "desc");
}

export function fetchByRegister(
  lesson_code: number,
  register_code: string
): QueryBuilder<Response, Response | undefined> {
  return Response.query().findOne({
    lesson_code,
    register_code
  });
}

export async function sendActivity(registerData: IResponse): Promise<Response> {
  return await Response.query().insert({
    lesson_code: registerData.lesson_code,
    register_code: registerData.register_code,
    response_message: registerData.response_message,
    files: registerData.files
  });
}

export function toggleReceived(
  lesson_code: number,
  register_code: string
): QueryBuilder<Response, number> {
  return Response.query()
    .update({ received: true })
    .where("lesson_code", lesson_code)
    .where("register_code", register_code);
}
