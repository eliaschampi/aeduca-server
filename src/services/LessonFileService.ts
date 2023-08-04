import LessonFiles from "../model/LessonFiles";

export async function myLessonFiles(lesson_code: number): Promise<LessonFiles[]> {
  return await LessonFiles.query()
    .withGraphFetched("file")
    .where("lesson_code", lesson_code)
    .whereNull("register_code");
}

export async function store(
  lesson_code: number,
  file_code: number
): Promise<LessonFiles> {
  return await LessonFiles.query().insert({
    lesson_code,
    file_code
  });
}

export async function storeMany(
  items: { file_code: number; lesson_code: number; register_code: string }[]
): Promise<LessonFiles> {
  return await LessonFiles.query().insert(items);
}

export async function remove(code: number): Promise<number> {
  return await LessonFiles.query().deleteById(code);
}

export async function removeBySesion(lesson_code: number): Promise<number> {
  return await LessonFiles.query().where("lesson_code", lesson_code).delete();
}

export async function removeByRegisterAndSesion(
  lesson_code: number,
  register_code: string
): Promise<number> {
  return await LessonFiles.query()
    .where("lesson_code", lesson_code)
    .where("register_code", register_code)
    .delete();
}
