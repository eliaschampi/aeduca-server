import { nextyaKnex } from "../con/NextyaKnexConnection";
import {
  CourseEvolutionItem,
  CourseScoreItem,
  ScoreEvolutionItem,
  SectionScore,
  StudentAnswer,
  StudentResult
} from "../model/Nextya";

export class NextyaService {
  private async getStudentCodeByDni(dni: string): Promise<string | null> {
    try {
      const result = await nextyaKnex("students")
        .select("code")
        .where("dni", dni)
        .first();

      return result?.code || null;
    } catch {
      return null;
    }
  }

  async getStudentResults(dni: string): Promise<StudentResult[]> {
    const studentCode = await this.getStudentCodeByDni(dni);
    const register = await nextyaKnex("registers")
      .select("code")
      .where("student_code", studentCode)
      .first();
    try {
      const rawResults = await nextyaKnex("student_register_results")
        .select("*")
        .whereIn("register_code", [register.code])
        .orderBy("eval_date", "desc");
      return rawResults;
    } catch {
      return [];
    }
  }

  async getStudentAnswers(dni: string, evalCode: string): Promise<StudentAnswer[]> {
    const studentCode = await this.getStudentCodeByDni(dni);
    if (!studentCode) return [];

    try {
      // Get register code for the student
      const register = await nextyaKnex("registers")
        .select("code")
        .where("student_code", studentCode)
        .first();

      if (!register) return [];

      const answers = await nextyaKnex("eval_answers")
        .join("eval_questions", "eval_questions.code", "eval_answers.question_code")
        .join("eval_sections", "eval_questions.section_code", "eval_sections.code")
        .join("courses", "courses.code", "eval_sections.course_code")
        .select(
          "eval_answers.question_code",
          "eval_answers.student_answer",
          "eval_questions.order_in_eval",
          "eval_questions.correct_key",
          "eval_questions.section_code",
          "eval_sections.course_code",
          "courses.name as course_name"
        )
        .where("eval_answers.register_code", register.code)
        .where("eval_questions.eval_code", evalCode)
        .orderBy("eval_questions.order_in_eval", "asc");

      return answers.map((answer) => ({
        question_code: answer.question_code,
        student_answer: answer.student_answer,
        order_in_eval: answer.order_in_eval,
        correct_key: answer.correct_key,
        is_correct: answer.student_answer === answer.correct_key,
        is_blank: !answer.student_answer,
        is_multiple: answer.student_answer === "error_multiple",
        section_code: answer.section_code,
        course_name: answer.course_name
      }));
    } catch {
      return [];
    }
  }

  async getStudentScoreEvolution(dni: string): Promise<ScoreEvolutionItem[]> {
    const studentCode = await this.getStudentCodeByDni(dni);
    if (!studentCode) return [];

    try {
      const result = await nextyaKnex.raw(
        "SELECT eval_code, eval_name, eval_date, score FROM get_student_score_evolution(?)",
        [studentCode]
      );
      return result.rows || [];
    } catch {
      return [];
    }
  }

  async getStudentCourseScores(dni: string): Promise<CourseScoreItem[]> {
    const studentCode = await this.getStudentCodeByDni(dni);
    if (!studentCode) return [];

    try {
      const result = await nextyaKnex.raw(
        "SELECT course_code, course_name, average_score FROM get_student_course_scores(?)",
        [studentCode]
      );
      return result.rows || [];
    } catch {
      return [];
    }
  }

  async getStudentCourseEvolution(
    dni: string,
    courseCode?: string
  ): Promise<CourseEvolutionItem[]> {
    const studentCode = await this.getStudentCodeByDni(dni);
    if (!studentCode) return [];

    try {
      const result = await nextyaKnex.raw(
        "SELECT eval_code, eval_name, eval_date, course_code, course_name, score FROM get_student_course_evolution_by_course(?, ?)",
        [studentCode, courseCode || null]
      );
      return result.rows || [];
    } catch {
      return [];
    }
  }

  async getSectionScores(dni: string, evalCode: string): Promise<SectionScore[]> {
    const studentCode = await this.getStudentCodeByDni(dni);
    if (!studentCode) return [];

    try {
      const register = await nextyaKnex("registers")
        .select("code")
        .where("student_code", studentCode)
        .first();

      if (!register) return [];

      const sectionResults = await nextyaKnex("eval_results")
        .join("eval_sections", "eval_sections.code", "eval_results.section_code")
        .join("courses", "courses.code", "eval_sections.course_code")
        .select(
          "eval_results.section_code",
          "courses.name as section_name",
          "eval_results.correct_count",
          "eval_results.incorrect_count",
          "eval_results.blank_count",
          "eval_results.score"
        )
        .where("eval_results.register_code", register.code)
        .where("eval_results.eval_code", evalCode)
        .whereNotNull("eval_results.section_code")
        .orderBy("courses.name", "asc");

      return sectionResults.map((section) => ({
        section_code: section.section_code,
        section_name: section.section_name,
        correct_count: section.correct_count,
        incorrect_count: section.incorrect_count,
        blank_count: section.blank_count,
        total_questions:
          section.correct_count + section.incorrect_count + section.blank_count,
        score:
          typeof section.score === "string" ? parseFloat(section.score) : section.score
      }));
    } catch {
      return [];
    }
  }
}
