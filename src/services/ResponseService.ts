import { QueryBuilder } from "objection";
import Response, { IResponse } from "../model/Response";
import { removeByRegisterAndSesion, storeMany } from "./LessonFileService";

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
