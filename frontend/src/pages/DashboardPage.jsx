import { useEffect, useState } from 'react';
import { BookOpen, CalendarCheck, ChartNoAxesCombined, Clock3, GraduationCap, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api, alertError } from '../services/api.js';
import { formatTime } from '../utils/format.js';
import { Badge, EmptyState, Loading, PageHeader, StatCard } from '../components/ui.jsx';

const roleCopy = {
  admin: ['Centro de control', 'Resumen institucional', 'Consulta el movimiento y estado general de tu institución.'],
  professor: ['Espacio docente', 'Tu jornada académica', 'Gestiona tus cursos y acompaña el progreso de tus estudiantes.'],
  student: ['Portal estudiantil', 'Tu progreso, de un vistazo', 'Revisa tus cursos, rendimiento y próximas clases.']
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  useEffect(() => { api.get('/dashboard').then(({ data: response }) => setData(response.data)).catch(alertError); }, []);
  if (!data) return <Loading full />;
  const copy = roleCopy[user.role];
  return <><PageHeader eyebrow={copy[0]} title={`${copy[1]}, ${user.name.split(' ')[0]}`} description={copy[2]} />
    {user.role === 'admin' && <AdminDashboard data={data} />}
    {user.role === 'professor' && <ProfessorDashboard data={data} />}
    {user.role === 'student' && <StudentDashboard data={data} />}
  </>;
}

function AdminDashboard({ data }) {
  return <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Usuarios activos" value={data.stats.users} icon={Users} /><StatCard label="Cursos creados" value={data.stats.courses} icon={BookOpen} tone="green" /><StatCard label="Matrículas activas" value={data.stats.enrollments} icon={GraduationCap} tone="amber" /><StatCard label="Cursos abiertos" value={data.stats.activeCourses} icon={CalendarCheck} tone="coral" /></div><section className="card mt-6 p-5 sm:p-6"><div className="mb-5"><h2 className="font-display text-lg font-bold text-navy-950">Matrículas recientes</h2><p className="text-sm text-slate-500">Últimos movimientos registrados en el sistema.</p></div>{data.recent.length ? <div className="space-y-2">{data.recent.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3"><div><p className="font-bold text-slate-800">{item.student_name}</p><p className="text-sm text-slate-500">Se inscribió en {item.course_name}</p></div><Badge tone="blue">Nueva</Badge></div>)}</div> : <EmptyState />}</section></>;
}

function ProfessorDashboard({ data }) {
  return <><div className="grid gap-4 sm:grid-cols-3"><StatCard label="Cursos asignados" value={data.stats.courses} icon={BookOpen} /><StatCard label="Estudiantes" value={data.stats.students} icon={Users} tone="green" /><StatCard label="Cursos activos" value={data.stats.activeCourses} icon={CalendarCheck} tone="coral" /></div><CourseList courses={data.courses} /></>;
}

function StudentDashboard({ data }) {
  return <><div className="grid gap-4 sm:grid-cols-3"><StatCard label="Cursos activos" value={data.stats.courses} icon={BookOpen} /><StatCard label="Promedio general" value={data.stats.average === null ? 'Sin notas' : `${data.stats.average}%`} icon={ChartNoAxesCombined} tone="green" /><StatCard label="Asistencia" value={data.stats.attendanceRate === null ? 'Sin registros' : `${data.stats.attendanceRate}%`} icon={CalendarCheck} tone="coral" /></div><CourseList courses={data.schedule} /></>;
}

function CourseList({ courses = [] }) {
  return <section className="mt-6"><div className="mb-4"><h2 className="font-display text-lg font-bold text-navy-950">{courses.length ? 'Cursos y horarios' : 'Sin cursos por ahora'}</h2><p className="text-sm text-slate-500">Información de tu carga académica actual.</p></div>{courses.length ? <div className="grid gap-4 lg:grid-cols-2">{courses.map((course) => { let days = course.schedule_days; try { if (typeof days === 'string') days = JSON.parse(days); } catch { days = []; } return <article key={course.id} className="card flex items-center gap-4 p-5"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-50 font-display font-extrabold text-blue-700">{course.code?.slice(0, 2)}</span><div className="min-w-0 flex-1"><p className="truncate font-bold text-navy-950">{course.name}</p><p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><Clock3 size={15} />{days?.join(', ')} · {formatTime(course.start_time)}–{formatTime(course.end_time)}</p></div>{course.enrolled_count !== undefined && <Badge tone="blue">{course.enrolled_count} estudiantes</Badge>}</article>; })}</div> : <EmptyState title="Aún no tienes cursos" />}</section>;
}

