import { Router } from 'express';
import PDFDocument from 'pdfkit';
import { db } from '../database/connection.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { AppError, asyncHandler, ok } from '../utils/http.js';

const router = Router();
router.use(authenticate);

router.get('/overview', authorize('admin'), asyncHandler(async (_req, res) => {
  const courses = await db('courses as c').leftJoin('users as p', 'c.professor_id', 'p.id')
    .leftJoin('enrollments as e', function join() { this.on('c.id', 'e.course_id').andOnVal('e.status', '=', 'active'); })
    .select('c.id', 'c.code', 'c.name', 'c.capacity', 'c.status', 'p.name as professor_name')
    .countDistinct('e.id as enrolled_count')
    .select(db.raw('(SELECT ROUND(AVG((g2.score / NULLIF(g2.max_score, 0)) * 100), 1) FROM grades g2 JOIN enrollments e2 ON e2.id = g2.enrollment_id WHERE e2.course_id = c.id) as grade_average'))
    .select(db.raw("(SELECT ROUND(100 * SUM(CASE WHEN a2.status IN ('present','late') THEN 1 ELSE 0 END) / NULLIF(COUNT(a2.id), 0), 1) FROM attendance a2 JOIN enrollments e3 ON e3.id = a2.enrollment_id WHERE e3.course_id = c.id) as attendance_rate"))
    .groupBy('c.id', 'p.name').orderBy('c.name');
  ok(res, courses);
}));

router.get('/certificate/:studentId?', asyncHandler(async (req, res) => {
  const studentId = req.user.role === 'student' ? req.user.id : Number(req.params.studentId);
  if (req.user.role !== 'student' && req.user.role !== 'admin') throw new AppError('No tienes permiso para generar constancias.', 403);
  if (!studentId) throw new AppError('Selecciona un estudiante.', 422);
  const student = await db('users').where({ id: studentId, role: 'student' }).first();
  if (!student) throw new AppError('Estudiante no encontrado.', 404);
  const courses = await db('enrollments as e').join('courses as c', 'e.course_id', 'c.id')
    .leftJoin('users as p', 'c.professor_id', 'p.id').where('e.student_id', studentId).whereIn('e.status', ['active', 'completed'])
    .select('c.code', 'c.name', 'p.name as professor_name', 'e.status', 'e.enrolled_at');

  const doc = new PDFDocument({ size: 'LETTER', margin: 64, info: { Title: `Constancia - ${student.name}` } });
  const filename = `constancia-${student.student_code || student.id}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  doc.pipe(res);
  doc.rect(32, 32, 548, 728).lineWidth(2).stroke('#1d4ed8');
  doc.fillColor('#1d4ed8').fontSize(13).text('SISTEMA DE GESTIÓN ACADÉMICA', { align: 'center' });
  doc.moveDown(2).fillColor('#111827').fontSize(24).text('CONSTANCIA DE ESTUDIOS', { align: 'center' });
  doc.moveDown(2).fontSize(12).text('A quien corresponda:', { align: 'left' });
  doc.moveDown().fontSize(12).text(`Por este medio se hace constar que ${student.name}, identificado(a) con código estudiantil ${student.student_code || 'sin código asignado'}, se encuentra registrado(a) en esta institución y cursa las asignaturas detalladas a continuación:`, { align: 'justify', lineGap: 5 });
  doc.moveDown(1.5);
  courses.forEach((course, index) => doc.text(`${index + 1}. ${course.code} — ${course.name} (${course.status === 'active' ? 'En curso' : 'Completado'})`, { indent: 16, lineGap: 4 }));
  if (!courses.length) doc.text('No registra cursos activos o completados.', { indent: 16 });
  doc.moveDown(2).text(`Se extiende la presente constancia el ${new Intl.DateTimeFormat('es-GT', { dateStyle: 'long' }).format(new Date())}.`, { align: 'justify' });
  doc.moveDown(5).text('______________________________', { align: 'center' });
  doc.text('Administración Académica', { align: 'center' });
  doc.end();
}));

export default router;

