import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpenCheck, Eye, EyeOff, GraduationCap, LockKeyhole, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { alertError } from '../services/api.js';

const demos = [
  { label: 'Administrador', email: 'admin@academia.test' },
  { label: 'Profesor', email: 'profesor@academia.test' },
  { label: 'Estudiante', email: 'estudiante@academia.test' }
];

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const submit = async (event) => {
    event.preventDefault();
    try { await login(form.email, form.password); navigate('/'); } catch (error) { alertError(error, 'No fue posible iniciar sesión.'); }
  };
  const fillDemo = (email) => setForm({ email, password: 'Demo1234!' });
  return <div className="min-h-screen bg-navy-950 p-4 sm:p-6">
    <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl overflow-hidden rounded-[2rem] bg-white shadow-2xl sm:min-h-[calc(100vh-3rem)] lg:grid-cols-[1.08fr_.92fr]">
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-navy-900 via-blue-900 to-blue-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full border-[70px] border-white/5" /><div className="absolute -bottom-40 -left-24 h-[30rem] w-[30rem] rounded-full bg-coral-500/20 blur-3xl" />
        <div className="relative flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-coral-500"><GraduationCap /></span><div><p className="font-display text-xl font-extrabold">Ágora</p><p className="text-xs text-blue-200">Gestión académica</p></div></div>
        <div className="relative max-w-xl"><span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold"><BookOpenCheck size={17} /> Educación mejor organizada</span><h1 className="font-display text-5xl font-extrabold leading-[1.12]">Todo tu mundo académico, en un solo lugar.</h1><p className="mt-6 text-lg leading-8 text-blue-100">Cursos, matrículas, calificaciones y asistencia conectados en una plataforma sencilla para toda la comunidad educativa.</p></div>
        <p className="relative text-sm text-blue-200">Sistema de Gestión Académica · 2026</p>
      </section>
      <section className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md"><div className="mb-9 lg:hidden"><span className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-coral-500 text-white"><GraduationCap /></span><p className="font-display text-xl font-extrabold text-navy-950">Ágora</p></div><p className="text-sm font-bold uppercase tracking-[.18em] text-blue-600">Bienvenido de vuelta</p><h2 className="mt-2 font-display text-3xl font-extrabold text-navy-950">Inicia sesión</h2><p className="mt-2 text-sm text-slate-500">Ingresa con el correo asignado por tu institución.</p>
          <form onSubmit={submit} className="mt-8 space-y-5"><label className="block"><span className="label">Correo electrónico</span><div className="relative"><Mail className="absolute left-3.5 top-3 text-slate-400" size={19} /><input className="field pl-11" type="email" autoComplete="email" required placeholder="nombre@institucion.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div></label><label className="block"><span className="label">Contraseña</span><div className="relative"><LockKeyhole className="absolute left-3.5 top-3 text-slate-400" size={19} /><input className="field px-11" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required placeholder="Tu contraseña" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 rounded-lg p-1 text-slate-400 hover:text-slate-700" aria-label="Mostrar contraseña">{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div></label><button className="btn-primary w-full py-3" disabled={loading}>{loading ? 'Ingresando...' : <>Ingresar al sistema <ArrowRight size={18} /></>}</button></form>
          <div className="mt-8 border-t border-slate-200 pt-6"><p className="mb-3 text-center text-xs font-bold uppercase tracking-wider text-slate-400">Accesos de demostración</p><div className="grid grid-cols-1 gap-2 sm:grid-cols-3">{demos.map((demo) => <button key={demo.email} onClick={() => fillDemo(demo.email)} className="rounded-xl border border-slate-200 px-2 py-2 text-xs font-bold text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700">{demo.label}</button>)}</div><p className="mt-3 text-center text-xs text-slate-400">Contraseña: Demo1234!</p></div>
        </div>
      </section>
    </div>
  </div>;
}

