import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env.js';
import { db } from '../database/connection.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { AppError, asyncHandler, ok } from '../utils/http.js';

const router = Router();

router.post('/login', validate(z.object({
  email: z.string().email('Ingresa un correo válido.').transform((value) => value.toLowerCase().trim()),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.')
})), asyncHandler(async (req, res) => {
  const user = await db('users').where({ email: req.body.email }).first();
  if (!user || !(await bcrypt.compare(req.body.password, user.password_hash))) {
    throw new AppError('Correo o contraseña incorrectos.', 401);
  }
  if (!user.active) throw new AppError('Esta cuenta se encuentra desactivada.', 403);
  const token = jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
  const { password_hash: _, ...safeUser } = user;
  ok(res, { token, user: safeUser }, 'Sesión iniciada correctamente.');
}));

router.get('/me', authenticate, asyncHandler(async (req, res) => ok(res, req.user)));

router.patch('/me', authenticate, validate(z.object({
  name: z.string().min(3).max(120).optional(),
  phone: z.string().max(30).nullable().optional()
})), asyncHandler(async (req, res) => {
  await db('users').where({ id: req.user.id }).update({ ...req.body, updated_at: db.fn.now() });
  const user = await db('users').select('id', 'name', 'email', 'role', 'phone', 'student_code', 'active').where({ id: req.user.id }).first();
  ok(res, user, 'Perfil actualizado.');
}));

router.patch('/password', authenticate, validate(z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres.')
})), asyncHandler(async (req, res) => {
  const user = await db('users').where({ id: req.user.id }).first();
  if (!(await bcrypt.compare(req.body.currentPassword, user.password_hash))) throw new AppError('La contraseña actual no es correcta.', 422);
  const password_hash = await bcrypt.hash(req.body.newPassword, 12);
  await db('users').where({ id: req.user.id }).update({ password_hash, updated_at: db.fn.now() });
  ok(res, null, 'Contraseña actualizada.');
}));

export default router;

