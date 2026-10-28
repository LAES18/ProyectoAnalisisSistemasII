import { useEffect, useState } from 'react';
import { CalendarDays, Clock3, MapPin, UserRound } from 'lucide-react';
import { api, alertError } from '../../services/api.js';
import { EmptyState, Loading, PageHeader } from '../../components/ui.jsx';
import { formatTime } from '../../utils/format.js';

export default function SchedulePage() {
  const [courses, setCourses] = useState(null);
  useEffect(() => { api.get('/enrollments').then(({ data }) => setCourses(data.data.filter((x) => x.status === 'active'))).catch(alertError); }, []);
  if (!courses) return <Loading full />;
  return <><PageHeader eyebrow="Organización" title="Mi horario" description="Ten a mano los días, horas y aulas de tus cursos activos." />{courses.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{courses.map((course, index) => <article key={course.id} className="card p-5"><div className="mb-5 flex items-center gap-3"><span className={`grid h-12 w-12 place-items-center rounded-xl font-display font-extrabold ${index % 3 === 0 ? 'bg-blue-100 text-blue-700' : index % 3 === 1 ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>{course.course_code.slice(0, 2)}</span><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{course.course_code}</p><h2 className="font-display font-bold text-navy-950">{course.course_name}</h2></div></div><div className="space-y-3 text-sm text-slate-600"><p className="flex gap-3"><CalendarDays size={18} className="text-blue-600" />{course.schedule_days.join(', ')}</p><p className="flex gap-3"><Clock3 size={18} className="text-blue-600" />{formatTime(course.start_time)}–{formatTime(course.end_time)}</p><p className="flex gap-3"><MapPin size={18} className="text-blue-600" />{course.room || 'Aula por asignar'}</p><p className="flex gap-3"><UserRound size={18} className="text-blue-600" />{course.professor_name || 'Profesor por asignar'}</p></div></article>)}</div> : <EmptyState title="No tienes cursos activos" text="Al inscribirte en un curso, su horario aparecerá aquí." />}</>;
}

