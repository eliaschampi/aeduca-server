import { QueryBuilder } from "objection";
import Person from "../model/Person";
import Response, { IResponse } from "../model/Response";
import { removeByRegisterAndSesion, storeMany } from "./LessonFileService";

export function regsByLesson(
  lesson_code: number,
  sc: string,
  skip: number
): QueryBuilder<Person, Person[]> {
  return Person.query()
    .select([
      "person.dni",
      "person.name",
      "person.lastname",
      "profile.image",
      "register.code",
      "register.section_code",
      "response.*"
    ])
    .join("register", "person.dni", "register.student_dni")
    .join("profile", "person.dni", "profile.person_dni")
    .join("response", function () {
      this.on("response.register_code", "register.code").andOnVal(
        "response.lesson_code",
        lesson_code
      );
    })
    .where("register.section_code", "like", sc)
    .offset(skip)
    .limit(15);
}

export function fetchByRegister(
  lesson_code: number,
  register_code: string
): QueryBuilder<Response, Response | undefined> {
  return Response.query().withGraphFetched("files.[file]").findOne({
    lesson_code,
    register_code
  });
}

export async function sendActivity(registerData: IResponse): Promise<Response> {
  await storeMany(registerData.files);
  return await Response.query().insert({
    lesson_code: registerData.lesson_code,
    register_code: registerData.register_code,
    response_message: registerData.response_message
  });
}

export async function removeR(
  lesson_code: number,
  register_code: string
): Promise<number> {
  await removeByRegisterAndSesion(lesson_code, register_code);
  return await Response.query()
    .where("lesson_code", lesson_code)
    .where("register_code", register_code)
    .delete();
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
