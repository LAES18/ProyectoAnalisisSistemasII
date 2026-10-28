import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '../database/connection.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { AppError, asyncHandler, ok } from '../utils/http.js';
import { publicUserColumns } from '../utils/serializers.js';

const router = Router();
router.use(authenticate, authorize('admin'));

const userSchema = z.object({
  name: z.string().min(3, 'El nombre es obligatorio.').max(120),
  email: z.string().email('Correo inválido.').transform((value) => value.toLowerCase().trim()),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.').optional(),
  role: z.enum(['admin', 'professor', 'student']),
  phone: z.string().max(30).nullable().optional(),
  student_code: z.string().max(40).nullable().optional(),
  active: z.boolean().optional()
});

router.get('/', asyncHandler(async (req, res) => {
  const query = db('users').select(publicUserColumns).orderBy('created_at', 'desc');
  if (req.query.role) query.where('role', req.query.role);
  if (req.query.search) query.where((builder) => builder.whereLike('name', `%${req.query.search}%`).orWhereLike('email', `%${req.query.search}%`));
  ok(res, await query);
}));

router.get('/options', asyncHandler(async (_req, res) => {
  const users = await db('users').select('id', 'name', 'email', 'role', 'student_code').where({ active: true }).whereIn('role', ['student', 'professor']).orderBy('name');
  ok(res, users);
}));

router.post('/', validate(userSchema), asyncHandler(async (req, res) => {
  if (!req.body.password) throw new AppError('La contraseña es obligatoria.', 422);
  if (req.body.role === 'student' && !req.body.student_code) {
    req.body.student_code = `EST-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
  }
  const { password, ...data } = req.body;
  data.password_hash = await bcrypt.hash(password, 12);
  const [id] = await db('users').insert(data);
  ok(res.status(201), await db('users').select(publicUserColumns).where({ id }).first(), 'Usuario creado.');
}));

router.patch('/:id', validate(userSchema.partial()), asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const existing = await db('users').where({ id }).first();
  if (!existing) throw new AppError('Usuario no encontrado.', 404);
  if (id === req.user.id && req.body.active === false) throw new AppError('No puedes desactivar tu propia cuenta.', 422);
  const { password, ...data } = req.body;
  if (password) data.password_hash = await bcrypt.hash(password, 12);
  await db('users').where({ id }).update({ ...data, updated_at: db.fn.now() });
  ok(res, await db('users').select(publicUserColumns).where({ id }).first(), 'Usuario actualizado.');
}));

export default router;

