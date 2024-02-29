import { QueryBuilder, raw } from "objection";
import Score, { IScore } from "../model/Score";
import Person from "../model/Person";

export const fetchByLessonWithReg = (
  lesson_code: number,
  section_code: string,
  type: string,
  skip: number
) => {
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
      ).as("cali")
    ])
    .join("register", "person.dni", "register.student_dni")
    .join("profile", "person.dni", "profile.person_dni")
    .leftJoin("score", function () {
      this.on("score.register_code", "register.code")
        .andOnVal("score.lesson_code", lesson_code)
        .andOnVal("score.type", type);
    })
    .where("register.section_code", "like", section_code)
    .orderByRaw("score.score DESC NULLS LAST")
    .offset(skip)
    .limit(15);
};

export function updateOrCreate(scoreData: IScore | IScore[]): QueryBuilder<Score, Score> {
  return Score.query()
    .insert(scoreData)
    .onConflict(["lesson_code", "register_code"])
    .merge()
    .returning("*");
}

export function removeScore(
  lesson_code: number,
  register_code: string
): QueryBuilder<Score, number> {
  return Score.query()
    .where("lesson_code", lesson_code)
    .where("register_code", register_code)
    .delete();
}

export function removeAll(lesson_code: number): QueryBuilder<Score, number> {
  return Score.query().where("lesson_code", lesson_code).delete();
}
