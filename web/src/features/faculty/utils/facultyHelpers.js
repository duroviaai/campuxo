export const getFullName = (faculty) =>
  faculty?.fullName || `${faculty?.firstName ?? ''} ${faculty?.lastName ?? ''}`.trim() || '—';

export const FACULTY_COLS = ['Name', 'Email', 'Faculty ID', 'Actions'];

export const EMPTY_FACULTY_FORM = {
  name: '',
  email: '',
  facultyId: '',
};
