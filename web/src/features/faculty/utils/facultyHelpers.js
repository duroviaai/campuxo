export const getFullName = (faculty) =>
  faculty?.fullName || `${faculty?.firstName ?? ''} ${faculty?.lastName ?? ''}`.trim() || '—';

export const FACULTY_COLS = ['Name', 'Email', 'Faculty ID', 'Department', 'Designation', 'Courses', 'Status', 'Actions'];

export const DEPARTMENTS = [
  'Computer Science', 'Information Science', 'Electronics & Communication',
  'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering',
  'Mathematics', 'Physics', 'Chemistry', 'Management Studies', 'Commerce', 'Arts',
];

export const DESIGNATIONS = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer'];

export const QUALIFICATIONS = ['Ph.D', 'M.Phil', 'M.Tech', 'M.E', 'M.Sc', 'M.Com', 'MBA', 'MCA', 'B.Tech', 'B.E', 'B.Sc', 'B.Com', 'BCA'];

export const EMPTY_FACULTY_FORM = {
  name: '',
  email: '',
  facultyId: '',
  department: '',
  departmentId: null,
  phone: '',
  designation: '',
  qualification: '',
  experience: '',
  subjects: '',
  joiningDate: '',
};
