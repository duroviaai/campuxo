export const getFullName = (student) =>
  student?.fullName || `${student?.firstName ?? ''} ${student?.lastName ?? ''}`.trim() || '—';

export const STUDENT_COLS = ['Name', 'Email', 'Reg. No.', 'Department', 'Year', 'Batch', 'Scheme', 'Actions'];

export const DEPARTMENTS = ['BCA', 'BSc', 'BCom', 'BA'];

export const SCHEMES = ['NEP', 'SEP'];

export const EMPTY_STUDENT_FORM = {
  firstName: '',
  lastName: '',
  phone: '',
  department: '',
  classBatchId: '',
  yearOfStudy: '',
  scheme: '',
  dateOfBirth: '',
};
