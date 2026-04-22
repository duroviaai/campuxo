export const getFullName = (faculty) =>
  faculty?.fullName || `${faculty?.firstName ?? ''} ${faculty?.lastName ?? ''}`.trim() || '—';

export const FACULTY_COLS = ['Name', 'Email', 'Faculty ID', 'Department', 'Phone', 'Courses', 'Actions'];

export const DEPARTMENTS = ['BCA', 'BSc', 'BCom', 'BA'];

export const EMPTY_FACULTY_FORM = {
  name: '',
  email: '',
  facultyId: '',
  department: '',
  phone: '',
};
