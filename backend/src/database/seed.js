import bcrypt from 'bcryptjs';
import { db } from './connection.js';

export async function seedDemoData() {
  const [{ total }] = await db('users').count('* as total');
  if (Number(total) > 0) return false;

  const passwordHash = await bcrypt.hash('Demo1234!', 12);
  const [adminId] = await db('users').insert({
    name: 'Administración Académica', email: 'admin@academia.test', password_hash: passwordHash, role: 'admin'
  });
  const [professorId] = await db('users').insert({
    name: 'Ana López', email: 'profesor@academia.test', password_hash: passwordHash, role: 'professor', phone: '5555-0101'
  });
  const [studentId] = await db('users').insert({
    name: 'Carlos Méndez', email: 'estudiante@academia.test', password_hash: passwordHash, role: 'student', student_code: 'EST-2026-001'
  });

  const now = new Date();
  const end = new Date(now);
  end.setMonth(end.getMonth() + 5);
  const isoDate = (date) => date.toISOString().slice(0, 10);
  const [courseId] = await db('courses').insert({
    code: 'MAT-101', name: 'Matemática Fundamental', description: 'Fundamentos matemáticos y resolución de problemas.',
    professor_id: professorId, schedule_days: JSON.stringify(['Lunes', 'Miércoles']), start_time: '08:00', end_time: '09:30',
    room: 'A-201', capacity: 30, status: 'open', start_date: isoDate(now), end_date: isoDate(end)
  });
  await db('courses').insert({
    code: 'PRO-201', name: 'Programación Web', description: 'Desarrollo de aplicaciones modernas para la web.',
    professor_id: professorId, schedule_days: JSON.stringify(['Martes', 'Jueves']), start_time: '10:00', end_time: '11:30',
    room: 'Lab-2', capacity: 25, status: 'open', start_date: isoDate(now), end_date: isoDate(end)
  });
  const [enrollmentId] = await db('enrollments').insert({ student_id: studentId, course_id: courseId });
  await db('grades').insert([
    { enrollment_id: enrollmentId, concept: 'Primer parcial', score: 88, max_score: 100, weight: 40, date: isoDate(now) },
    { enrollment_id: enrollmentId, concept: 'Proyecto práctico', score: 94, max_score: 100, weight: 60, date: isoDate(now) }
  ]);
  await db('attendance').insert([
    { enrollment_id: enrollmentId, date: isoDate(now), status: 'present' }
  ]);
  return Boolean(adminId);
}

