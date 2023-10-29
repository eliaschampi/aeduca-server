import Content from "../model/Content";

export function fetchByLesson(lesson_code: number) {
  return Content.query().findById(lesson_code);
}
