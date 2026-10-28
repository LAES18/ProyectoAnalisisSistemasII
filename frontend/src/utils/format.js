export const formatDate = (value) => value ? new Intl.DateTimeFormat('es-GT', { dateStyle: 'medium' }).format(new Date(`${String(value).slice(0, 10)}T12:00:00`)) : '—';
export const formatTime = (value) => value ? String(value).slice(0, 5) : '—';
export const roleName = { admin: 'Administrador', professor: 'Profesor', student: 'Estudiante' };
export const statusName = { active: 'Activo', inactive: 'Inactivo', draft: 'Borrador', open: 'Inscripciones abiertas', closed: 'Cerrado', completed: 'Completado', withdrawn: 'Retirado', present: 'Presente', absent: 'Ausente', late: 'Tarde', excused: 'Justificado' };
export const initials = (name = '') => name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();

