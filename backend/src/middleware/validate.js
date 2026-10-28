import { AppError } from '../utils/http.js';

export const validate = (schema, source = 'body') => (req, _res, next) => {
  const parsed = schema.safeParse(req[source]);
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message }));
    return next(new AppError('Revisa los datos enviados.', 422, details));
  }
  req[source] = parsed.data;
  next();
};

