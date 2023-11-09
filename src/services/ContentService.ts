import Content from "../model/Content";

export function fetchByLesson(lesson_code: number) {
  return Content.query().findById(lesson_code);
}

export function update(lesson_code: number, data: object) {
  return Content.query()
    .findById(lesson_code)
    .patch({
      ...data
    });
}
