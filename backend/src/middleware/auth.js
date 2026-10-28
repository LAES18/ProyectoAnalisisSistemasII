import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { db } from '../database/connection.js';
import { AppError, asyncHandler } from '../utils/http.js';

export const authenticate = asyncHandler(async (req, _res, next) => {
  const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null;
  if (!token) throw new AppError('Debes iniciar sesión para continuar.', 401);
  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new AppError('Tu sesión venció. Inicia sesión nuevamente.', 401);
  }
  const user = await db('users').select('id', 'name', 'email', 'role', 'active', 'student_code', 'phone').where({ id: payload.sub }).first();
  if (!user?.active) throw new AppError('La cuenta no está disponible.', 401);
  req.user = user;
  next();
});

export const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) return next(new AppError('No tienes permiso para realizar esta acción.', 403));
  next();
};

