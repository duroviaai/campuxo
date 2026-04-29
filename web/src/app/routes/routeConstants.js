const ROUTES = {
  HOME: '/',
  LANDING: '/home',
  LOGIN: '/login',
  REGISTER: '/register',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_STUDENTS:        '/admin/students',
  ADMIN_FACULTY:        '/admin/faculty',
  ADMIN_FACULTY_CREATE:  '/admin/faculty/create',
  ADMIN_FACULTY_EDIT:    '/admin/faculty/:id/edit',
  ADMIN_FACULTY_ASSIGN_COURSES: '/admin/faculty/:id/assign-courses',
  ADMIN_COURSES:        '/admin/courses',
  ADMIN_OVERVIEW:    '/admin/overview',
  ADMIN_ATTENDANCE:  '/admin/attendance',
  ADMIN_IA:          '/admin/ia',
  ADMIN_APPROVALS:   '/admin/approvals',
  ADMIN_REGISTRATION_WINDOWS: '/admin/registration-windows',
  ADMIN_TIMETABLE:    '/admin/timetable',

  // Faculty
  FACULTY_DASHBOARD:  '/faculty/dashboard',
  FACULTY_COURSES:    '/faculty/courses',
  FACULTY_ATTENDANCE: '/faculty/attendance',
  FACULTY_IA:         '/faculty/ia',
  FACULTY_COURSE_STUDENTS: '/faculty/courses/:courseId/students',

  // Faculty — attendance summary per course
  FACULTY_COURSE_ATTENDANCE_SUMMARY: '/faculty/attendance/summary',

  // Student
  STUDENT_DASHBOARD:  '/student/dashboard',
  STUDENT_COURSES:    '/student/courses',
  STUDENT_ATTENDANCE: '/student/attendance',
  STUDENT_PROFILE:    '/student/profile',
  STUDENT_IA:         '/student/ia',
  STUDENT_COMPLETE_PROFILE: '/student/complete-profile',
  STUDENT_TIMETABLE: '/student/timetable',

  // Faculty profile
  FACULTY_PROFILE: '/faculty/profile',
  FACULTY_TIMETABLE: '/faculty/timetable',

  // Admin mark attendance
  ADMIN_MARK_ATTENDANCE: '/admin/attendance/mark',

  // Faculty — view individual student attendance
  FACULTY_STUDENT_ATTENDANCE: '/faculty/students/:studentId/attendance',

  // HOD
  HOD_DASHBOARD:        '/hod/dashboard',
  HOD_FACULTY:          '/hod/faculty',
  HOD_STUDENTS:         '/hod/students',
  HOD_COURSES:          '/hod/courses',
  HOD_MY_COURSES:       '/hod/my-courses',
  HOD_TIMETABLE:        '/hod/timetable',
  HOD_PROFILE:          '/hod/profile',
  HOD_ATTENDANCE:       '/hod/attendance',
  HOD_MARK_ATTENDANCE:  '/hod/my-attendance',
  HOD_IA:               '/hod/ia',
  HOD_MY_IA:            '/hod/my-ia',
  NOTIFICATIONS: '/notifications',
  ADMIN_ANNOUNCEMENTS: '/admin/announcements',
};

export default ROUTES;
