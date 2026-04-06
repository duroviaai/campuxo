import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './providers/AuthProvider';
import ErrorBoundary from '../shared/components/feedback/ErrorBoundary';
import Loader from '../shared/components/feedback/Loader';
import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import AdminGuard from '../guards/AdminGuard';
import FacultyGuard from '../guards/FacultyGuard';
import StudentGuard from '../guards/StudentGuard';
import GuestGuard from '../guards/GuestGuard';
import ProtectedRoute from './routes/ProtectedRoute';
import ROUTES from './routes/routeConstants';
import useAuth from '../features/auth/hooks/useAuth';
import { getToken, getUser } from '../shared/utils/tokenUtils';

// ── Public ────────────────────────────────────────────────────────────────────
const LandingPage           = lazy(() => import('../features/landing'));
const LoginPage             = lazy(() => import('../features/auth/pages/LoginPage'));
const MultiStepRegisterPage = lazy(() => import('../features/auth/pages/MultiStepRegisterPage'));

// ── Dashboards ────────────────────────────────────────────────────────────────
const AdminDashboardPage   = lazy(() => import('../features/dashboard/pages/AdminDashboardPage'));
const FacultyDashboardPage = lazy(() => import('../features/dashboard/pages/FacultyDashboardPage'));
const StudentDashboardPage = lazy(() => import('../features/dashboard/pages/StudentDashboardPage'));

// ── Admin ─────────────────────────────────────────────────────────────────────
const StudentListPage      = lazy(() => import('../features/student/pages/StudentListPage'));
const CreateStudentPage    = lazy(() => import('../features/student/pages/CreateStudentPage'));
const EditStudentPage      = lazy(() => import('../features/student/pages/EditStudentPage'));
const StudentDetailsPage   = lazy(() => import('../features/student/pages/StudentDetailsPage'));
const FacultyListPage      = lazy(() => import('../features/faculty/pages/FacultyListPage'));
const CreateFacultyPage    = lazy(() => import('../features/faculty/pages/CreateFacultyPage'));
const EditFacultyPage      = lazy(() => import('../features/faculty/pages/EditFacultyPage'));
const AssignCoursesPage    = lazy(() => import('../features/faculty/pages/AssignCoursesPage'));
const CourseListPage       = lazy(() => import('../features/course/pages/CourseListPage'));
const CreateCoursePage     = lazy(() => import('../features/course/pages/CreateCoursePage'));
const EditCoursePage       = lazy(() => import('../features/course/pages/EditCoursePage'));
const AttendancePage       = lazy(() => import('../features/attendance/pages/AttendancePage'));
const MarkAttendancePage   = lazy(() => import('../features/attendance/pages/MarkAttendancePage'));
const ClassListPage        = lazy(() => import('../features/admin/pages/ClassListPage'));
const AdminAttendancePage  = lazy(() => import('../features/admin/pages/AdminAttendancePage'));

const FacultyCoursesPage    = lazy(() => import('../features/faculty/pages/FacultyCoursesPage'));
const FacultyAttendancePage = lazy(() => import('../features/faculty/pages/FacultyAttendancePage'));
const FacultyProfilePage    = lazy(() => import('../features/faculty/pages/FacultyProfilePage'));
const FacultyStudentAttendancePage = lazy(() => import('../features/faculty/pages/FacultyStudentAttendancePage'));

// ── Student ───────────────────────────────────────────────────────────────────
const StudentCoursesPage    = lazy(() => import('../features/student/pages/StudentCoursesPage'));
const StudentAttendancePage = lazy(() => import('../features/student/pages/StudentAttendancePage'));
const StudentProfilePage    = lazy(() => import('../features/student/pages/StudentProfilePage'));

// ── Redirects ─────────────────────────────────────────────────────────────────
const RoleRedirect = () => {
  const { user } = useAuth();
  const roles = user?.roles ?? [];
  if (roles.includes('ROLE_ADMIN'))   return <Navigate to={ROUTES.ADMIN_DASHBOARD}   replace />;
  if (roles.includes('ROLE_FACULTY')) return <Navigate to={ROUTES.FACULTY_DASHBOARD} replace />;
  return <Navigate to={ROUTES.STUDENT_DASHBOARD} replace />;
};

const RootRedirect = () => {
  const token = getToken();
  const user  = getUser();
  if (!token) return <Navigate to={ROUTES.LANDING} replace />;
  const roles = user?.roles ?? [];
  if (roles.includes('ROLE_ADMIN'))   return <Navigate to={ROUTES.ADMIN_DASHBOARD}   replace />;
  if (roles.includes('ROLE_FACULTY')) return <Navigate to={ROUTES.FACULTY_DASHBOARD} replace />;
  return <Navigate to={ROUTES.STUDENT_DASHBOARD} replace />;
};

const App = () => (
  <ErrorBoundary>
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            error: { duration: 5000, style: { fontSize: '0.8125rem', maxWidth: '360px' } },
          }}
        />
        <Suspense fallback={<Loader />}>
          <Routes>
            {/* Public */}
            <Route path={ROUTES.HOME} element={<RootRedirect />} />
            <Route element={<PublicLayout />}>
              <Route path={ROUTES.LANDING} element={<LandingPage />} />
            </Route>
            <Route element={<GuestGuard />}>
              <Route element={<PublicLayout />}>
                <Route path={ROUTES.LOGIN}    element={<LoginPage />} />
                <Route path={ROUTES.REGISTER} element={<MultiStepRegisterPage />} />
              </Route>
            </Route>

            {/* All authenticated routes share DashboardLayout */}
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>

              {/* Role-agnostic redirect */}
              <Route path={ROUTES.DASHBOARD} element={<RoleRedirect />} />

              {/* ── ADMIN ── */}
              <Route element={<AdminGuard />}>
                <Route path={ROUTES.ADMIN_DASHBOARD}       element={<AdminDashboardPage />} />
                <Route path={ROUTES.ADMIN_STUDENTS}        element={<StudentListPage />} />
                <Route path={ROUTES.ADMIN_STUDENTS_CREATE} element={<CreateStudentPage />} />
                <Route path={ROUTES.ADMIN_STUDENTS_EDIT}   element={<EditStudentPage />} />
                <Route path={ROUTES.ADMIN_STUDENTS_DETAIL} element={<StudentDetailsPage />} />
                <Route path={ROUTES.ADMIN_FACULTY}         element={<FacultyListPage />} />
                <Route path={ROUTES.ADMIN_FACULTY_CREATE}  element={<CreateFacultyPage />} />
                <Route path={ROUTES.ADMIN_FACULTY_EDIT}    element={<EditFacultyPage />} />
                <Route path={ROUTES.ADMIN_FACULTY_ASSIGN_COURSES} element={<AssignCoursesPage />} />
                <Route path={ROUTES.ADMIN_COURSES}         element={<CourseListPage />} />
                <Route path={ROUTES.ADMIN_COURSES_CREATE}  element={<CreateCoursePage />} />
                <Route path={ROUTES.ADMIN_COURSES_EDIT}    element={<EditCoursePage />} />
                <Route path={ROUTES.ADMIN_CLASSES}         element={<ClassListPage />} />
                <Route path={ROUTES.ADMIN_ATTENDANCE}      element={<AdminAttendancePage />} />
                <Route path={ROUTES.ADMIN_MARK_ATTENDANCE} element={<MarkAttendancePage />} />
              </Route>

              {/* ── FACULTY ── */}
              <Route element={<FacultyGuard />}>
                <Route path={ROUTES.FACULTY_DASHBOARD}  element={<FacultyDashboardPage />} />
                <Route path={ROUTES.FACULTY_COURSES}    element={<FacultyCoursesPage />} />
                <Route path={ROUTES.FACULTY_ATTENDANCE} element={<FacultyAttendancePage />} />
                <Route path={ROUTES.FACULTY_PROFILE}    element={<FacultyProfilePage />} />
                <Route path={ROUTES.FACULTY_STUDENT_ATTENDANCE} element={<FacultyStudentAttendancePage />} />
              </Route>

              {/* ── STUDENT ── */}
              <Route element={<StudentGuard />}>
                <Route path={ROUTES.STUDENT_DASHBOARD}  element={<StudentDashboardPage />} />
                <Route path={ROUTES.STUDENT_COURSES}    element={<StudentCoursesPage />} />
                <Route path={ROUTES.STUDENT_ATTENDANCE} element={<StudentAttendancePage />} />
                <Route path={ROUTES.STUDENT_PROFILE}    element={<StudentProfilePage />} />
              </Route>

            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  </ErrorBoundary>
);

export default App;
