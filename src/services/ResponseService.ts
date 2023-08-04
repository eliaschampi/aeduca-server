import { QueryBuilder, raw, ref } from "objection";
import Person from "../model/Person";
import Register from "../model/Register";
import Response, { IResponse } from "../model/Response";
import { removeByRegisterAndSesion, storeMany } from "./LessonFileService";

export function countRegsByLesson(
  sc: string
): QueryBuilder<Register, Register | undefined> {
  return Register.query()
    .where(
      "section_code",
      "like",
      sc.length === 10 ? sc : `${new Date().getFullYear().toString() + sc}%`
    )
    .count()
    .first();
}

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
      raw(
        "json_build_object('score', calification_item.score, 'keys', calification_item.keys)"
      ).as("cali"),
      Response.query()
        .where("response.register_code", ref("register.code"))
        .where("response.lesson_code", lesson_code)
        .count()
        .as("activity")
    ])
    .join("register", "person.dni", "register.student_dni")
    .join("profile", "person.dni", "profile.person_dni")
    .leftJoin("calification_item", function () {
      this.on("calification_item.register_code", "register.code").andOnVal(
        "calification_item.lesson_code",
        lesson_code
      );
    })
    .where(
      "register.section_code",
      "like",
      sc.length === 10 ? sc : `${new Date().getFullYear().toString() + sc}%`
    )
    .orderByRaw("calification_item.score DESC NULLS LAST")
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
