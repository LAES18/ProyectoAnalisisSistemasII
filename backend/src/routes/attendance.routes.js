import { Router } from 'express';
import { z } from 'zod';
import { db } from '../database/connection.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { AppError, asyncHandler, ok } from '../utils/http.js';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(async (req, res) => {
  const query = db('attendance as a').join('enrollments as e', 'a.enrollment_id', 'e.id')
    .join('users as s', 'e.student_id', 's.id').join('courses as c', 'e.course_id', 'c.id')
    .select('a.*', 's.name as student_name', 's.student_code', 'c.id as course_id', 'c.code as course_code', 'c.name as course_name')
    .orderBy('a.date', 'desc');
  if (req.user.role === 'student') query.where('e.student_id', req.user.id);
  if (req.user.role === 'professor') query.where('c.professor_id', req.user.id);
  if (req.query.course_id) query.where('c.id', req.query.course_id);
  ok(res, await query);
}));

router.post('/bulk', authorize('professor'), validate(z.object({
  course_id: z.coerce.number().int().positive(), date: z.string().date(),
  records: z.array(z.object({ enrollment_id: z.coerce.number().int().positive(), status: z.enum(['present', 'absent', 'late', 'excused']), notes: z.string().max(1000).nullable().optional() })).min(1)
})), asyncHandler(async (req, res) => {
  const course = await db('courses').where({ id: req.body.course_id, professor_id: req.user.id }).first();
  if (!course) throw new AppError('No tienes acceso a este curso.', 403);
  const validIds = await db('enrollments').where({ course_id: course.id, status: 'active' }).whereIn('id', req.body.records.map((item) => item.enrollment_id)).pluck('id');
  if (validIds.length !== req.body.records.length) throw new AppError('Uno o más estudiantes no pertenecen al curso.', 422);
  await db.transaction(async (trx) => {
    for (const record of req.body.records) {
      await trx('attendance').insert({ ...record, date: req.body.date }).onConflict(['enrollment_id', 'date']).merge({
        status: record.status, notes: record.notes ?? null, updated_at: trx.fn.now()
      });
    }
  });
  ok(res, { saved: req.body.records.length }, 'Asistencia guardada.');
}));

export default router;

