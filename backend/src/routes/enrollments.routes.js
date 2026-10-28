import { Router } from 'express';
import { z } from 'zod';
import { db } from '../database/connection.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { AppError, asyncHandler, ok } from '../utils/http.js';
import { serializeCourse } from '../utils/serializers.js';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(async (req, res) => {
  const query = db('enrollments as e')
    .join('users as s', 'e.student_id', 's.id').join('courses as c', 'e.course_id', 'c.id')
    .leftJoin('users as p', 'c.professor_id', 'p.id')
    .select('e.*', 's.name as student_name', 's.email as student_email', 's.student_code', 'c.code as course_code', 'c.name as course_name',
      'c.schedule_days', 'c.start_time', 'c.end_time', 'c.room', 'c.status as course_status', 'p.name as professor_name')
    .orderBy('e.enrolled_at', 'desc');
  if (req.user.role === 'student') query.where('e.student_id', req.user.id);
  if (req.user.role === 'professor') query.where('c.professor_id', req.user.id);
  if (req.query.course_id) query.where('e.course_id', req.query.course_id);
  const rows = (await query).map((row) => ({ ...row, schedule_days: serializeCourse(row).schedule_days }));
  ok(res, rows);
}));

router.post('/', validate(z.object({ course_id: z.coerce.number().int().positive(), student_id: z.coerce.number().int().positive().optional() })), asyncHandler(async (req, res) => {
  if (!['admin', 'student'].includes(req.user.role)) throw new AppError('No tienes permiso para matricular estudiantes.', 403);
  const studentId = req.user.role === 'student' ? req.user.id : req.body.student_id;
  if (!studentId) throw new AppError('Selecciona un estudiante.', 422);
  const result = await db.transaction(async (trx) => {
    const course = await trx('courses').where({ id: req.body.course_id }).forUpdate().first();
    if (!course) throw new AppError('Curso no encontrado.', 404);
    if (course.status !== 'open') throw new AppError('Las inscripciones de este curso no están abiertas.', 409);
    const student = await trx('users').where({ id: studentId, role: 'student', active: true }).first();
    if (!student) throw new AppError('Estudiante no válido.', 422);
    const [{ total }] = await trx('enrollments').where({ course_id: course.id, status: 'active' }).count('* as total');
    if (Number(total) >= course.capacity) throw new AppError('El curso ya no tiene cupos disponibles.', 409);
    const previous = await trx('enrollments').where({ course_id: course.id, student_id: studentId }).first();
    if (previous) {
      if (previous.status === 'active') throw new AppError('El estudiante ya está inscrito en este curso.', 409);
      await trx('enrollments').where({ id: previous.id }).update({ status: 'active', enrolled_at: trx.fn.now(), updated_at: trx.fn.now() });
      return previous.id;
    }
    const [id] = await trx('enrollments').insert({ course_id: course.id, student_id: studentId });
    return id;
  });
  ok(res.status(201), { id: result }, 'Matrícula registrada correctamente.');
}));

router.patch('/:id/status', authorize('admin'), validate(z.object({ status: z.enum(['active', 'withdrawn', 'completed']) })), asyncHandler(async (req, res) => {
  const updated = await db('enrollments').where({ id: req.params.id }).update({ status: req.body.status, updated_at: db.fn.now() });
  if (!updated) throw new AppError('Matrícula no encontrada.', 404);
  ok(res, null, 'Estado de matrícula actualizado.');
}));

export default router;
