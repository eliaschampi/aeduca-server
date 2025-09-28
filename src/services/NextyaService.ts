import { nextyaKnex } from "../con/NextyaKnexConnection";

export interface StudentInfo {
  code: string;
  name: string;
  last_name: string;
  dni: string;
  email?: string;
}

export interface StudentResult {
  result_code: string;
  register_code: string;
  student_code: string;
  name: string;
  last_name: string;
  roll_code: string;
  group_name: string;
  level_code: string;
  level_name: string;
  eval_code: string;
  eval_name: string;
  eval_date: string;
  section_code?: string;
  correct_count: number;
  incorrect_count: number;
  blank_count: number;
  score: number;
  calculated_at: string;
}

export interface StudentAnswer {
  question_code: string;
  student_answer: string | null;
  order_in_eval: number;
  correct_key: string;
  is_correct: boolean;
  is_blank: boolean;
  is_multiple: boolean;
  section_code?: string;
  section_name?: string;
}

export class NextyaService {
  async getStudentCodeByDni(dni: string): Promise<string | null> {
    try {
      const result = await nextyaKnex("students")
        .select("code")
        .where("dni", dni)
        .first();

      return result?.code || null;
    } catch (error) {
      console.error("Error getting student code by DNI:", error);
      return null;
    }
  }

  async getStudentInfo(dni: string): Promise<StudentInfo | null> {
    try {
      const result = await nextyaKnex("students")
        .select("code", "name", "last_name", "dni", "email")
        .where("dni", dni)
        .first();

      return result || null;
    } catch (error) {
      console.error("Error getting student info:", error);
      return null;
    }
  }

  async getStudentResults(dni: string): Promise<StudentResult[]> {
    const studentCode = await this.getStudentCodeByDni(dni);
    if (!studentCode) return [];

    try {
      const results = await nextyaKnex("eval_results")
        .join("registers", "eval_results.register_code", "registers.code")
        .join("students", "registers.student_code", "students.code")
        .join("evals", "eval_results.eval_code", "evals.code")
        .join("levels", "registers.level_code", "levels.code")
        .leftJoin("eval_sections", "eval_results.section_code", "eval_sections.code")
        .select(
          "eval_results.code as result_code",
          "eval_results.register_code",
          "students.code as student_code",
          "students.name",
          "students.last_name",
          "registers.roll_code",
          "registers.group_name",
          "levels.code as level_code",
          "levels.name as level_name",
          "evals.code as eval_code",
          "evals.name as eval_name",
          "evals.eval_date",
          "eval_sections.code as section_code",
          "eval_results.correct_count",
          "eval_results.incorrect_count",
          "eval_results.blank_count",
          "eval_results.score",
          "eval_results.calculated_at"
        )
        .where("students.code", studentCode)
        .orderBy("evals.eval_date", "desc");

      return results || [];
    } catch (error) {
      console.error("Error getting student results:", error);
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
        .leftJoin("eval_sections", "eval_questions.section_code", "eval_sections.code")
        .select(
          "eval_answers.question_code",
          "eval_answers.student_answer",
          "eval_questions.order_in_eval",
          "eval_questions.correct_key",
          "eval_sections.code as section_code",
          "eval_sections.name as section_name"
        )
        .where("eval_answers.register_code", register.code)
        .where("eval_questions.eval_code", evalCode)
        .orderBy("eval_questions.order_in_eval", "asc");

      return answers.map(answer => ({
        question_code: answer.question_code,
        student_answer: answer.student_answer,
        order_in_eval: answer.order_in_eval,
        correct_key: answer.correct_key,
        is_correct: answer.student_answer === answer.correct_key,
        is_blank: !answer.student_answer,
        is_multiple: answer.student_answer === "error_multiple",
        section_code: answer.section_code,
        section_name: answer.section_name
      }));
    } catch (error) {
      console.error("Error getting student answers:", error);
      return [];
    }
  }

  async getStudentScoreEvolution(dni: string): Promise<any[]> {
    const code = await this.getStudentCodeByDni(dni);
    if (!code) return [];

    try {
      const result = await nextyaKnex.raw(
        "SELECT * FROM get_student_score_evolution(?)",
        [code]
      );
      return result.rows || [];
    } catch (error) {
      console.error("Error getting student score evolution:", error);
      return [];
    }
  }

  async getStudentCourseScores(dni: string): Promise<any[]> {
    const code = await this.getStudentCodeByDni(dni);
    if (!code) return [];

    try {
      const result = await nextyaKnex.raw("SELECT * FROM get_student_course_scores(?)", [
        code
      ]);
      return result.rows || [];
    } catch (error) {
      console.error("Error getting student course scores:", error);
      return [];
    }
  }

  async getStudentCourseEvolution(dni: string, courseCode?: string): Promise<any[]> {
    const studentCode = await this.getStudentCodeByDni(dni);
    if (!studentCode) return [];

    try {
      let query = nextyaKnex("eval_results")
        .join("eval_sections", "eval_results.section_code", "eval_sections.code")
        .join("courses", "eval_sections.course_code", "courses.code")
        .join("evals", "eval_results.eval_code", "evals.code")
        .join("registers", "eval_results.register_code", "registers.code")
        .select(
          "evals.eval_code",
          "evals.name as eval_name",
          "evals.eval_date",
          "eval_results.score",
          "courses.code as course_code",
          "courses.name as course_name"
        )
        .where("registers.student_code", studentCode)
        .andWhere("eval_results.section_code", "IS NOT", null)
        .orderBy("evals.eval_date", "asc");

      if (courseCode) {
        query = query.andWhere("courses.code", courseCode);
      }

      const results = await query;
      return results;
    } catch (error) {
      console.error("Error getting student course evolution:", error);
      return [];
    }
  }
}
