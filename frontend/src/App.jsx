import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import AppLayout from './components/AppLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import UsersPage from './pages/admin/UsersPage.jsx';
import CoursesPage from './pages/admin/CoursesPage.jsx';
import EnrollmentsPage from './pages/admin/EnrollmentsPage.jsx';
import ReportsPage from './pages/admin/ReportsPage.jsx';
import AvailableCoursesPage from './pages/student/AvailableCoursesPage.jsx';
import AcademicPage from './pages/student/AcademicPage.jsx';
import SchedulePage from './pages/student/SchedulePage.jsx';
import CertificatePage from './pages/student/CertificatePage.jsx';
import ProfessorCoursesPage from './pages/professor/ProfessorCoursesPage.jsx';
import GradesPage from './pages/professor/GradesPage.jsx';
import AttendancePage from './pages/professor/AttendancePage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

function Protected({ children }) { const { user } = useAuth(); return user ? children : <Navigate to="/login" replace />; }
function RoleRoute({ roles, children }) { const { user } = useAuth(); return roles.includes(user.role) ? children : <Navigate to="/" replace />; }

export default function App() {
  const { user } = useAuth();
  return <Routes>
    <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
    <Route element={<Protected><AppLayout /></Protected>}>
      <Route index element={<DashboardPage />} />
      <Route path="perfil" element={<ProfilePage />} />
      <Route path="usuarios" element={<RoleRoute roles={['admin']}><UsersPage /></RoleRoute>} />
      <Route path="cursos" element={<RoleRoute roles={['admin']}><CoursesPage /></RoleRoute>} />
      <Route path="matriculas" element={<RoleRoute roles={['admin']}><EnrollmentsPage /></RoleRoute>} />
      <Route path="reportes" element={<RoleRoute roles={['admin']}><ReportsPage /></RoleRoute>} />
      <Route path="mis-cursos" element={<RoleRoute roles={['professor']}><ProfessorCoursesPage /></RoleRoute>} />
      <Route path="calificaciones" element={<RoleRoute roles={['professor']}><GradesPage /></RoleRoute>} />
      <Route path="asistencia" element={<RoleRoute roles={['professor']}><AttendancePage /></RoleRoute>} />
      <Route path="cursos-disponibles" element={<RoleRoute roles={['student']}><AvailableCoursesPage /></RoleRoute>} />
      <Route path="mi-academico" element={<RoleRoute roles={['student']}><AcademicPage /></RoleRoute>} />
      <Route path="mi-horario" element={<RoleRoute roles={['student']}><SchedulePage /></RoleRoute>} />
      <Route path="constancia" element={<RoleRoute roles={['student']}><CertificatePage /></RoleRoute>} />
    </Route>
    <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
  </Routes>;
}

