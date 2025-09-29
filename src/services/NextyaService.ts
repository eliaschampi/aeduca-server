import { nextyaKnex } from "../con/NextyaKnexConnection";
import {
  CourseEvolutionItem,
  CourseScoreItem,
  ScoreEvolutionItem,
  StudentAnswer,
  StudentResult
} from "../model/Nextya";

export class NextyaService {
  /**
   * Core helper: Get register code by DNI
   * Used internally by all chart data methods
   */
  private async getRegisterCodeByDni(dni: string): Promise<string | null> {
    try {
      const result = await nextyaKnex("registers")
        .select("code")
        .whereExists(
          nextyaKnex("students")
            .select("code")
            .where("students.code", "registers.student_code")
        )
        .where("students.dni", dni)
        .first();

      return result?.code || null;
    } catch (error) {
      console.error("Error getting student code by DNI:", error);
      return null;
    }
  }

  async getStudentResults(dni: string): Promise<StudentResult[]> {
    const studentCode = await this.getRegisterCodeByDni(dni);
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
    const studentCode = await this.getRegisterCodeByDni(dni);
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

      return answers.map((answer) => ({
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

  /**
   * Get student score evolution data for Chart.js line chart
   * Perfect for time-series visualization with chronological data
   * Uses optimized PostgreSQL function: get_student_score_evolution()
   */
  async getStudentScoreEvolution(dni: string): Promise<ScoreEvolutionItem[]> {
    const studentCode = await this.getRegisterCodeByDni(dni);
    if (!studentCode) return [];

    try {
      const result = await nextyaKnex.raw(
        "SELECT eval_code, eval_name, eval_date, score FROM get_student_score_evolution(?)",
        [studentCode]
      );
      return result.rows || [];
    } catch (error) {
      console.error("[NextyaService] Score evolution query failed:", error);
      return [];
    }
  }

  /**
   * Get student course average scores for Chart.js doughnut/pie chart
   * Perfect for showing course performance distribution
   * Uses optimized PostgreSQL function: get_student_course_scores()
   */
  async getStudentCourseScores(dni: string): Promise<CourseScoreItem[]> {
    const studentCode = await this.getRegisterCodeByDni(dni);
    if (!studentCode) return [];

    try {
      const result = await nextyaKnex.raw(
        "SELECT course_code, course_name, average_score FROM get_student_course_scores(?)",
        [studentCode]
      );
      return result.rows || [];
    } catch (error) {
      console.error("[NextyaService] Course scores query failed:", error);
      return [];
    }
  }

  /**
   * Get student course evolution data for Chart.js bar chart
   * Perfect for showing performance trends by course over time
   * Uses optimized PostgreSQL function: get_student_course_evolution_by_course()
   *
   * @param dni - Student DNI
   * @param courseCode - Optional course filter for specific course evolution
   */
  async getStudentCourseEvolution(
    dni: string,
    courseCode?: string
  ): Promise<CourseEvolutionItem[]> {
    const studentCode = await this.getRegisterCodeByDni(dni);
    if (!studentCode) return [];

    try {
      const result = await nextyaKnex.raw(
        "SELECT eval_code, eval_name, eval_date, course_code, course_name, score FROM get_student_course_evolution_by_course(?, ?)",
        [studentCode, courseCode || null]
      );
      return result.rows || [];
    } catch (error) {
      console.error("[NextyaService] Course evolution query failed:", error);
      return [];
    }
  }
}
