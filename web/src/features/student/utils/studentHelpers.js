export const getFullName = (student) =>
  student?.fullName || `${student?.firstName ?? ''} ${student?.lastName ?? ''}`.trim() || '—';

export const STUDENT_COLS = ['Name', 'Email', 'Registration Number', 'Actions'];

export const DEPARTMENTS = ['BCA', 'BSc', 'BCom', 'BA'];

export const EMPTY_STUDENT_FORM = {
  firstName: '',
  lastName: '',
  phone: '',
  department: '',
  classBatchId: '',
  yearOfStudy: '',
  dateOfBirth: '',
};
