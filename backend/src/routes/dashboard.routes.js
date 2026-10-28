import { Router } from 'express';
import { db } from '../database/connection.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler, ok } from '../utils/http.js';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(async (req, res) => {
  if (req.user.role === 'admin') {
    const [[users], [courses], [enrollments], [activeCourses]] = await Promise.all([
      db('users').where({ active: true }).count('* as total'), db('courses').count('* as total'),
      db('enrollments').where({ status: 'active' }).count('* as total'), db('courses').where({ status: 'open' }).count('* as total')
    ]);
    const recent = await db('enrollments as e').join('users as s', 'e.student_id', 's.id').join('courses as c', 'e.course_id', 'c.id')
      .select('e.id', 'e.enrolled_at', 's.name as student_name', 'c.name as course_name').orderBy('e.enrolled_at', 'desc').limit(6);
    return ok(res, { stats: { users: Number(users.total), courses: Number(courses.total), enrollments: Number(enrollments.total), activeCourses: Number(activeCourses.total) }, recent });
  }

  if (req.user.role === 'professor') {
    const [[courses], [students], [pendingAttendance]] = await Promise.all([
      db('courses').where({ professor_id: req.user.id }).count('* as total'),
      db('enrollments as e').join('courses as c', 'e.course_id', 'c.id').where('c.professor_id', req.user.id).where('e.status', 'active').countDistinct('e.student_id as total'),
      db('courses').where({ professor_id: req.user.id, status: 'open' }).count('* as total')
    ]);
    const assigned = await db('courses as c').leftJoin('enrollments as e', function join() { this.on('c.id', 'e.course_id').andOnVal('e.status', '=', 'active'); })
      .where('c.professor_id', req.user.id).select('c.id', 'c.code', 'c.name', 'c.schedule_days', 'c.start_time', 'c.end_time').countDistinct('e.id as enrolled_count').groupBy('c.id').limit(5);
    return ok(res, { stats: { courses: Number(courses.total), students: Number(students.total), activeCourses: Number(pendingAttendance.total) }, courses: assigned });
  }

  const [[enrollments], grades, attendance] = await Promise.all([
    db('enrollments').where({ student_id: req.user.id, status: 'active' }).count('* as total'),
    db('grades as g').join('enrollments as e', 'g.enrollment_id', 'e.id').where('e.student_id', req.user.id).select('g.score', 'g.max_score', 'g.weight'),
    db('attendance as a').join('enrollments as e', 'a.enrollment_id', 'e.id').where('e.student_id', req.user.id).select('a.status')
  ]);
  const weighted = grades.reduce((sum, g) => sum + (Number(g.score) / Number(g.max_score)) * Number(g.weight), 0);
  const weight = grades.reduce((sum, g) => sum + Number(g.weight), 0);
  const average = weight ? Math.round((weighted / weight) * 100) : null;
  const attended = attendance.filter((item) => ['present', 'late'].includes(item.status)).length;
  const attendanceRate = attendance.length ? Math.round((attended / attendance.length) * 100) : null;
  const schedule = await db('enrollments as e').join('courses as c', 'e.course_id', 'c.id').leftJoin('users as p', 'c.professor_id', 'p.id')
    .where('e.student_id', req.user.id).where('e.status', 'active').select('c.id', 'c.code', 'c.name', 'c.schedule_days', 'c.start_time', 'c.end_time', 'c.room', 'p.name as professor_name');
  ok(res, { stats: { courses: Number(enrollments.total), average, attendanceRate }, schedule });
}));

export default router;

