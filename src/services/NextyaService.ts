import { nextyaKnex } from "../con/NextyaKnexConnection";

/**
 * NextYa Student Analytics Service
 * Optimized for Chart.js integration with clean SQL function calls
 * No fallbacks - uses only optimized PostgreSQL functions from Nextya database
 */

// Core types for student data
export type StudentInfo = {
  code: string;
  name: string;
  last_name: string;
  dni: string;
  email?: string;
};

export type StudentResult = {
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
};

export type StudentAnswer = {
  question_code: string;
  student_answer: string | null;
  order_in_eval: number;
  correct_key: string;
  is_correct: boolean;
  is_blank: boolean;
  is_multiple: boolean;
  section_code?: string;
  section_name?: string;
};

// Chart.js optimized types
export type ScoreEvolutionItem = {
  eval_code: string;
  eval_name: string;
  eval_date: string; // ISO date for Chart.js time axis
  score: number; // Numeric for Chart.js datasets
};

export type CourseScoreItem = {
  course_code: string;
  course_name: string;
  average_score: number; // Rounded for Chart.js doughnut
};

export type CourseEvolutionItem = {
  eval_code: string;
  eval_name: string;
  eval_date: string; // ISO date for Chart.js time axis
  course_code: string;
  course_name: string;
  score: number; // Numeric for Chart.js bar chart
};

export class NextyaService {
  /**
   * Core helper: Get student code by DNI
   * Used internally by all chart data methods
   */
  private async getStudentCodeByDni(dni: string): Promise<string | null> {
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

  /**
   * Get basic student information
   * Used by Score module for student display
   */
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
    const studentCode = await this.getStudentCodeByDni(dni);
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
    const studentCode = await this.getStudentCodeByDni(dni);
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
    const studentCode = await this.getStudentCodeByDni(dni);
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
