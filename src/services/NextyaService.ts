import { nextyaKnex } from "../con/NextyaKnexConnection";

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
