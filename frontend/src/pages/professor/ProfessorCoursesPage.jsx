import { useEffect, useState } from 'react';
import { CalendarDays, Clock3, MapPin, Users } from 'lucide-react';
import { api, alertError } from '../../services/api.js';
import { Badge, EmptyState, Loading, PageHeader } from '../../components/ui.jsx';
import { formatDate, formatTime, statusName } from '../../utils/format.js';

export default function ProfessorCoursesPage() {
  const [courses, setCourses] = useState(null);
  useEffect(() => { api.get('/courses').then(({ data }) => setCourses(data.data)).catch(alertError); }, []);
  if (!courses) return <Loading full />;
  return <><PageHeader eyebrow="Docencia" title="Mis cursos" description="Consulta los grupos, horarios y estudiantes que tienes asignados." />{courses.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{courses.map((course) => <article key={course.id} className="card overflow-hidden"><div className="bg-navy-900 p-5 text-white"><div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-widest text-blue-200">{course.code}</p><Badge tone={course.status === 'open' ? 'green' : 'slate'}>{statusName[course.status]}</Badge></div><h2 className="mt-2 font-display text-xl font-extrabold">{course.name}</h2><p className="mt-2 line-clamp-2 min-h-10 text-sm text-blue-100">{course.description || 'Sin descripción.'}</p></div><div className="space-y-3 p-5 text-sm text-slate-600"><p className="flex gap-3"><Users size={18} className="text-blue-600" />{course.enrolled_count} estudiantes inscritos</p><p className="flex gap-3"><CalendarDays size={18} className="text-blue-600" />{course.schedule_days.join(', ')}</p><p className="flex gap-3"><Clock3 size={18} className="text-blue-600" />{formatTime(course.start_time)}–{formatTime(course.end_time)}</p><p className="flex gap-3"><MapPin size={18} className="text-blue-600" />{course.room || 'Sin aula'} · hasta {formatDate(course.end_date)}</p></div></article>)}</div> : <EmptyState title="No tienes cursos asignados" text="Cuando administración te asigne un curso, aparecerá aquí." />}</>;
}

