export function notFound(req, res) {
  res.status(404).json({ success: false, message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, _req, res, _next) {
  const status = error.status || (error.code === 'ER_DUP_ENTRY' ? 409 : 500);
  const message = error.code === 'ER_DUP_ENTRY' ? 'Ya existe un registro con esos datos.' : error.message;
  if (status >= 500) console.error(error);
  res.status(status).json({ success: false, message: status >= 500 ? 'Ocurrió un error interno.' : message, details: error.details });
}
