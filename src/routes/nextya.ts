import { Router, Request, Response } from 'express';
import { NextyaService } from '../services/NextyaService';

const router = Router();
const nextyaService = new NextyaService();

/**
 * GET /student/:dni/scores
 * Returns score evolution data for a student by DNI
 */
router.get('/student/:dni/scores', async (req: Request, res: Response) => {
  const { dni } = req.params;

  if (!dni) {
    return res.status(400).json({ error: 'DNI no proporcionado' });
  }

  try {
    const data = await nextyaService.getStudentScoreEvolution(dni);

    if (!data) {
      return res.status(500).json({ error: 'No se pudieron obtener datos de evolución de puntajes' });
    }

    return res.json(data);
  } catch (error) {
    console.error('Error en endpoint de evolución de puntajes:', error);
    return res.status(500).json({ error: 'Error al procesar datos de evolución de puntajes' });
  }
});

/**
 * GET /student/:dni/courses
 * Returns course scores data for a student by DNI
 */
router.get('/student/:dni/courses', async (req: Request, res: Response) => {
  const { dni } = req.params;

  if (!dni) {
    return res.status(400).json({ error: 'DNI no proporcionado' });
  }

  try {
    const data = await nextyaService.getStudentCourseScores(dni);

    if (!data) {
      return res.status(500).json({ error: 'No se pudieron obtener datos de cursos' });
    }

    return res.json(data);
  } catch (error) {
    console.error('Error en endpoint de scores de cursos:', error);
    return res.status(500).json({ error: 'Error al procesar datos de cursos' });
  }
});

/**
 * GET /student/:dni/course-evolution
 * Returns course evolution data for a student by DNI, optional course_code query param
 */
router.get('/student/:dni/course-evolution', async (req: Request, res: Response) => {
  const { dni } = req.params;
  const { course_code } = req.query;

  if (!dni) {
    return res.status(400).json({ error: 'DNI no proporcionado' });
  }

  try {
    const data = await nextyaService.getStudentCourseEvolution(dni, course_code as string);

    if (!data) {
      return res.status(500).json({ error: 'No se pudieron obtener datos de evolución por curso' });
    }

    return res.json(data);
  } catch (error) {
    console.error('Error en endpoint de evolución por curso:', error);
    return res.status(500).json({ error: 'Error al procesar datos de evolución por curso' });
  }
});

export default router;
