import { Router, Request, Response, NextFunction } from "express";
import { NextyaService } from "../services/NextyaService";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();
const nextyaService = new NextyaService();

router.get(
  "/student/:dni/results",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { dni } = req.params;

    if (!dni) {
      res.status(400).json({ error: "DNI no proporcionado" });
      return;
    }

    try {
      const data = await nextyaService.getStudentResults(dni);
      res.json(data);
    } catch (error) {
      next(error);
    }
  })
);

router.get(
  "/student/:dni/answers/:evalCode",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { dni, evalCode } = req.params;

    if (!dni || !evalCode) {
      res.status(400).json({ error: "DNI o código de evaluación no proporcionado" });
      return;
    }

    try {
      const data = await nextyaService.getStudentAnswers(dni, evalCode);
      res.json(data);
    } catch (error) {
      next(error);
    }
  })
);

router.get(
  "/student/:dni/scores",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { dni } = req.params;

    if (!dni) {
      res.status(400).json({ error: "DNI no proporcionado" });
      return;
    }

    try {
      const data = await nextyaService.getStudentScoreEvolution(dni);
      if (!data) {
        res
          .status(500)
          .json({ error: "No se pudieron obtener datos de evolución de puntajes" });
        return;
      }
      res.json(data);
    } catch (error) {
      next(error);
    }
  })
);

router.get(
  "/student/:dni/courses",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { dni } = req.params;

    if (!dni) {
      res.status(400).json({ error: "DNI no proporcionado" });
      return;
    }

    try {
      const data = await nextyaService.getStudentCourseScores(dni);

      if (!data) {
        res.status(500).json({ error: "No se pudieron obtener datos de cursos" });
        return;
      }

      res.json(data);
    } catch (error) {
      next(error);
    }
  })
);

router.get(
  "/student/:dni/course-evolution",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { dni } = req.params;
    const { course_code } = req.query;

    if (!dni) {
      res.status(400).json({ error: "DNI no proporcionado" });
      return;
    }

    try {
      const data = await nextyaService.getStudentCourseEvolution(
        dni,
        course_code as string
      );

      if (!data) {
        res
          .status(500)
          .json({ error: "No se pudieron obtener datos de evolución por curso" });
        return;
      }

      res.json(data);
    } catch (error) {
      next(error);
    }
  })
);

router.get(
  "/student/:dni/sections/:evalCode",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { dni, evalCode } = req.params;

    if (!dni || !evalCode) {
      res.status(400).json({ error: "DNI o código de evaluación no proporcionado" });
      return;
    }

    try {
      const data = await nextyaService.getSectionScores(dni, evalCode);
      res.json(data);
    } catch (error) {
      next(error);
    }
  })
);

export default router;
