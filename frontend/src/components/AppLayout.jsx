import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, CalendarDays, ChartNoAxesCombined, ClipboardCheck, GraduationCap, LayoutDashboard, LogOut, Menu, Settings, Users, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext.jsx';
import { initials, roleName } from '../utils/format.js';

const menus = {
  admin: [
    { to: '/', label: 'Resumen', icon: LayoutDashboard }, { to: '/usuarios', label: 'Usuarios', icon: Users },
    { to: '/cursos', label: 'Cursos y horarios', icon: BookOpen }, { to: '/matriculas', label: 'Matrículas', icon: GraduationCap },
    { to: '/reportes', label: 'Reportes', icon: ChartNoAxesCombined }
  ],
  professor: [
    { to: '/', label: 'Resumen', icon: LayoutDashboard }, { to: '/mis-cursos', label: 'Mis cursos', icon: BookOpen },
    { to: '/calificaciones', label: 'Calificaciones', icon: GraduationCap }, { to: '/asistencia', label: 'Asistencia', icon: ClipboardCheck }
  ],
  student: [
    { to: '/', label: 'Resumen', icon: LayoutDashboard }, { to: '/cursos-disponibles', label: 'Cursos disponibles', icon: BookOpen },
    { to: '/mi-academico', label: 'Notas y asistencia', icon: ChartNoAxesCombined }, { to: '/mi-horario', label: 'Mi horario', icon: CalendarDays },
    { to: '/constancia', label: 'Constancia', icon: GraduationCap }
  ]
};

export default function AppLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const menu = menus[user.role];
  const handleLogout = async () => {
    const result = await Swal.fire({ icon: 'question', title: '¿Cerrar sesión?', text: 'Tendrás que ingresar tus credenciales nuevamente.', showCancelButton: true, confirmButtonText: 'Cerrar sesión', cancelButtonText: 'Cancelar', reverseButtons: true });
    if (result.isConfirmed) { logout(); navigate('/login'); }
  };
  return <div className="min-h-screen bg-cream">
    {open && <button type="button" className="fixed inset-0 z-30 bg-navy-950/40 lg:hidden" onClick={() => setOpen(false)} aria-label="Cerrar menú" />}
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-navy-950 px-4 py-5 text-white transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center justify-between px-2"><NavLink to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}><span className="grid h-11 w-11 place-items-center rounded-xl bg-coral-500"><GraduationCap /></span><div><p className="font-display text-lg font-extrabold leading-none">Ágora</p><p className="mt-1 text-xs text-blue-200">Gestión académica</p></div></NavLink><button className="rounded-lg p-2 text-blue-200 lg:hidden" onClick={() => setOpen(false)}><X /></button></div>
      <nav className="mt-9 flex-1 space-y-1">{menu.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${isActive ? 'bg-white text-navy-950 shadow-lg' : 'text-blue-100 hover:bg-white/10 hover:text-white'}`}><Icon size={19} />{label}</NavLink>)}</nav>
      <div className="space-y-1 border-t border-white/10 pt-4"><NavLink to="/perfil" onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${isActive ? 'bg-white text-navy-950' : 'text-blue-100 hover:bg-white/10'}`}><Settings size={19} />Mi perfil</NavLink><button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-blue-100 hover:bg-white/10"><LogOut size={19} />Cerrar sesión</button></div>
    </aside>
    <div className="lg:pl-72">
      <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200/80 bg-cream/90 px-4 backdrop-blur-xl sm:px-7 lg:px-10"><button onClick={() => setOpen(true)} className="rounded-xl border border-slate-200 bg-white p-2.5 text-navy-950 lg:hidden"><Menu /></button><div className="hidden sm:block"><p className="text-sm font-semibold text-slate-400">{new Intl.DateTimeFormat('es-GT', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}</p></div><NavLink to="/perfil" className="ml-auto flex items-center gap-3 rounded-xl p-1.5 hover:bg-white"><div className="hidden text-right sm:block"><p className="text-sm font-bold text-navy-950">{user.name}</p><p className="text-xs text-slate-500">{roleName[user.role]}</p></div><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-100 text-sm font-extrabold text-blue-700">{initials(user.name)}</span></NavLink></header>
      <main key={location.pathname} className="mx-auto max-w-[1500px] animate-[fadeIn_.3s_ease] p-4 sm:p-7 lg:p-10"><Outlet /></main>
    </div>
  </div>;
}

