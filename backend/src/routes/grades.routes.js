import { Router } from 'express';
import { z } from 'zod';
import { db } from '../database/connection.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { AppError, asyncHandler, ok } from '../utils/http.js';

const router = Router();
router.use(authenticate);

const professorOwnsEnrollment = async (enrollmentId, professorId) => db('enrollments as e')
  .join('courses as c', 'e.course_id', 'c.id').where('e.id', enrollmentId).where('c.professor_id', professorId).first('e.id');

router.get('/', asyncHandler(async (req, res) => {
  const query = db('grades as g').join('enrollments as e', 'g.enrollment_id', 'e.id')
    .join('users as s', 'e.student_id', 's.id').join('courses as c', 'e.course_id', 'c.id')
    .select('g.*', 's.name as student_name', 's.student_code', 'c.id as course_id', 'c.code as course_code', 'c.name as course_name')
    .orderBy([{ column: 'c.name', order: 'asc' }, { column: 'g.date', order: 'desc' }]);
  if (req.user.role === 'student') query.where('e.student_id', req.user.id);
  if (req.user.role === 'professor') query.where('c.professor_id', req.user.id);
  if (req.query.course_id) query.where('c.id', req.query.course_id);
  if (req.query.enrollment_id) query.where('e.id', req.query.enrollment_id);
  ok(res, await query);
}));

router.post('/', authorize('professor'), validate(z.object({
  enrollment_id: z.coerce.number().int().positive(), concept: z.string().min(2).max(100),
  score: z.coerce.number().min(0), max_score: z.coerce.number().positive(), weight: z.coerce.number().min(0).max(100),
  date: z.string().date(), notes: z.string().max(1000).nullable().optional()
}).refine((data) => data.score <= data.max_score, { message: 'La nota no puede superar la nota máxima.', path: ['score'] })), asyncHandler(async (req, res) => {
  if (!(await professorOwnsEnrollment(req.body.enrollment_id, req.user.id))) throw new AppError('La matrícula no pertenece a uno de tus cursos.', 403);
  await db('grades').insert(req.body).onConflict(['enrollment_id', 'concept']).merge({
    score: req.body.score, max_score: req.body.max_score, weight: req.body.weight, date: req.body.date,
    notes: req.body.notes ?? null, updated_at: db.fn.now()
  });
  const grade = await db('grades').where({ enrollment_id: req.body.enrollment_id, concept: req.body.concept }).first();
  ok(res.status(201), grade, 'Calificación guardada.');
}));

router.delete('/:id', authorize('professor'), asyncHandler(async (req, res) => {
  const grade = await db('grades').where({ id: req.params.id }).first();
  if (!grade) throw new AppError('Calificación no encontrada.', 404);
  if (!(await professorOwnsEnrollment(grade.enrollment_id, req.user.id))) throw new AppError('No tienes acceso a esta calificación.', 403);
  await db('grades').where({ id: grade.id }).del();
  ok(res, null, 'Calificación eliminada.');
}));

export default router;

