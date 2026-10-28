import { Router } from 'express';
import { z } from 'zod';
import { db } from '../database/connection.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { AppError, asyncHandler, ok } from '../utils/http.js';
import { serializeCourse } from '../utils/serializers.js';

const router = Router();
router.use(authenticate);

const courseFields = z.object({
  code: z.string().min(2).max(30).transform((value) => value.toUpperCase().trim()),
  name: z.string().min(3).max(140),
  description: z.string().max(1500).nullable().optional(),
  professor_id: z.coerce.number().int().positive().nullable().optional(),
  schedule_days: z.array(z.string()).min(1, 'Selecciona al menos un día.'),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
  room: z.string().max(60).nullable().optional(),
  capacity: z.coerce.number().int().min(1).max(500),
  status: z.enum(['draft', 'open', 'closed', 'completed']),
  start_date: z.string().date(),
  end_date: z.string().date()
});
const courseSchema = courseFields.refine((data) => data.end_time > data.start_time, { message: 'La hora final debe ser posterior a la inicial.', path: ['end_time'] })
  .refine((data) => data.end_date >= data.start_date, { message: 'La fecha final debe ser posterior a la inicial.', path: ['end_date'] });

const listCourses = async (req) => {
  const query = db('courses as c')
    .leftJoin('users as p', 'c.professor_id', 'p.id')
    .leftJoin('enrollments as e', function join() { this.on('c.id', 'e.course_id').andOnVal('e.status', '=', 'active'); })
    .select('c.*', 'p.name as professor_name').countDistinct('e.id as enrolled_count').groupBy('c.id', 'p.name').orderBy('c.created_at', 'desc');
  if (req.user.role === 'professor') query.where('c.professor_id', req.user.id);
  if (req.user.role === 'student') query.where('c.status', 'open');
  return (await query).map(serializeCourse);
};

router.get('/', asyncHandler(async (req, res) => ok(res, await listCourses(req))));

router.get('/:id', asyncHandler(async (req, res) => {
  const course = await db('courses as c').leftJoin('users as p', 'c.professor_id', 'p.id').select('c.*', 'p.name as professor_name').where('c.id', req.params.id).first();
  if (!course) throw new AppError('Curso no encontrado.', 404);
  if (req.user.role === 'professor' && course.professor_id !== req.user.id) throw new AppError('No tienes acceso a este curso.', 403);
  const [{ enrolled_count }] = await db('enrollments').where({ course_id: course.id, status: 'active' }).count('* as enrolled_count');
  ok(res, serializeCourse({ ...course, enrolled_count: Number(enrolled_count) }));
}));

router.post('/', authorize('admin'), validate(courseSchema), asyncHandler(async (req, res) => {
  const data = { ...req.body, schedule_days: JSON.stringify(req.body.schedule_days) };
  const [id] = await db('courses').insert(data);
  ok(res.status(201), serializeCourse(await db('courses').where({ id }).first()), 'Curso creado.');
}));

router.patch('/:id', authorize('admin'), validate(courseFields.partial()), asyncHandler(async (req, res) => {
  const existing = await db('courses').where({ id: req.params.id }).first();
  if (!existing) throw new AppError('Curso no encontrado.', 404);
  const data = { ...req.body };
  if (data.schedule_days) data.schedule_days = JSON.stringify(data.schedule_days);
  await db('courses').where({ id: req.params.id }).update({ ...data, updated_at: db.fn.now() });
  ok(res, serializeCourse(await db('courses').where({ id: req.params.id }).first()), 'Curso actualizado.');
}));

router.delete('/:id', authorize('admin'), asyncHandler(async (req, res) => {
  const [{ total }] = await db('enrollments').where({ course_id: req.params.id }).count('* as total');
  if (Number(total)) throw new AppError('No se puede eliminar un curso que ya tiene matrículas. Puedes cerrarlo.', 409);
  const deleted = await db('courses').where({ id: req.params.id }).del();
  if (!deleted) throw new AppError('Curso no encontrado.', 404);
  ok(res, null, 'Curso eliminado.');
}));

export default router;

