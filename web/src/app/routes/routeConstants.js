const ROUTES = {
  HOME: '/',
  LANDING: '/home',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_STUDENTS:        '/admin/students',
  ADMIN_STUDENTS_CREATE: '/admin/students/create',
  ADMIN_STUDENTS_EDIT:   '/admin/students/:id/edit',
  ADMIN_FACULTY:        '/admin/faculty',
  ADMIN_FACULTY_CREATE:  '/admin/faculty/create',
  ADMIN_FACULTY_EDIT:    '/admin/faculty/:id/edit',
  ADMIN_FACULTY_ASSIGN_COURSES: '/admin/faculty/:id/assign-courses',
  ADMIN_COURSES:        '/admin/courses',
  ADMIN_COURSES_CREATE:  '/admin/courses/create',
  ADMIN_COURSES_EDIT:    '/admin/courses/:id/edit',
  ADMIN_ATTENDANCE:  '/admin/attendance',
  ADMIN_APPROVALS:   '/admin/approvals',
  ADMIN_APPROVALS:   '/admin/approvals',

  // Faculty
  FACULTY_DASHBOARD:  '/faculty/dashboard',
  FACULTY_COURSES:    '/faculty/courses',
  FACULTY_ATTENDANCE: '/faculty/attendance',

  // Student
  STUDENT_DASHBOARD:  '/student/dashboard',
  STUDENT_COURSES:    '/student/courses',
  STUDENT_ATTENDANCE: '/student/attendance',
  STUDENT_PROFILE:    '/student/profile',
  STUDENT_COMPLETE_PROFILE: '/student/complete-profile',

  // Faculty profile
  FACULTY_PROFILE: '/faculty/profile',

  // Admin student detail
  ADMIN_STUDENTS_DETAIL: '/admin/students/:id',

  // Admin mark attendance
  ADMIN_MARK_ATTENDANCE: '/admin/attendance/mark',
  ADMIN_CLASSES: '/admin/classes',

  // Faculty — view individual student attendance
  FACULTY_STUDENT_ATTENDANCE: '/faculty/students/:studentId/attendance',
};

export default ROUTES;
