export function parseDays(value) {
  if (Array.isArray(value)) return value;
  try { return JSON.parse(value || '[]'); } catch { return []; }
}

export function serializeCourse(course) {
  return course ? { ...course, schedule_days: parseDays(course.schedule_days) } : course;
}

export const publicUserColumns = ['id', 'name', 'email', 'role', 'phone', 'student_code', 'active', 'created_at', 'updated_at'];

