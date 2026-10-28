import { X, Inbox, LoaderCircle } from 'lucide-react';

export function PageHeader({ eyebrow, title, description, action }) {
  return <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
    <div><p className="mb-1 text-xs font-bold uppercase tracking-[.18em] text-blue-600">{eyebrow}</p><h1 className="font-display text-2xl font-extrabold tracking-tight text-navy-950 sm:text-3xl">{title}</h1>{description && <p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p>}</div>
    {action}
  </div>;
}

export function Modal({ open, title, description, children, onClose, size = 'max-w-xl' }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <div className={`max-h-[92vh] w-full ${size} overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7`}>
      <div className="mb-5 flex items-start justify-between gap-4"><div><h2 className="font-display text-xl font-bold text-navy-950">{title}</h2>{description && <p className="mt-1 text-sm text-slate-500">{description}</p>}</div><button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Cerrar"><X size={20} /></button></div>
      {children}
    </div>
  </div>;
}

export function Badge({ children, tone = 'slate' }) {
  const tones = { slate: 'bg-slate-100 text-slate-700', blue: 'bg-blue-100 text-blue-700', green: 'bg-emerald-100 text-emerald-700', amber: 'bg-amber-100 text-amber-700', red: 'bg-red-100 text-red-700', purple: 'bg-violet-100 text-violet-700' };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${tones[tone] || tones.slate}`}>{children}</span>;
}

export function EmptyState({ title = 'No hay información', text = 'Los registros aparecerán aquí cuando estén disponibles.', action }) {
  return <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center"><span className="mb-4 rounded-2xl bg-slate-100 p-4 text-slate-400"><Inbox size={28} /></span><h3 className="font-display font-bold text-slate-800">{title}</h3><p className="mt-1 max-w-sm text-sm text-slate-500">{text}</p>{action && <div className="mt-4">{action}</div>}</div>;
}

export function Loading({ full = false }) {
  return <div className={`flex items-center justify-center text-blue-600 ${full ? 'min-h-[60vh]' : 'min-h-48'}`}><LoaderCircle className="animate-spin" size={30} /></div>;
}

export function StatCard({ label, value, hint, icon: Icon, tone = 'blue' }) {
  const tones = { blue: 'bg-blue-50 text-blue-700', green: 'bg-emerald-50 text-emerald-700', amber: 'bg-amber-50 text-amber-700', coral: 'bg-orange-50 text-coral-500' };
  return <div className="card flex items-start justify-between p-5"><div><p className="text-sm font-semibold text-slate-500">{label}</p><p className="mt-2 font-display text-3xl font-extrabold text-navy-950">{value ?? '—'}</p>{hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}</div><span className={`rounded-2xl p-3 ${tones[tone]}`}><Icon size={22} /></span></div>;
}

export function Field({ label, error, children }) {
  return <label className="block"><span className="label">{label}</span>{children}{error && <span className="mt-1 block text-xs text-red-600">{error}</span>}</label>;
}

