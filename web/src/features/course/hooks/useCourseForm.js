import { useState, useEffect } from 'react';
import { getFaculty } from '../../faculty/services/facultyService';
import { getStudents } from '../../student/services/studentService';
import { EMPTY_COURSE_FORM } from '../utils/courseHelpers';

const useCourseForm = (initialData, onSubmit) => {
  const [form, setForm]             = useState({ ...EMPTY_COURSE_FORM, ...initialData });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState(null);
  const [facultyList, setFacultyList] = useState([]);
  const [studentList, setStudentList] = useState([]);

  useEffect(() => {
    getFaculty({ size: 200 }).then((d) => setFacultyList(d.content ?? d)).catch(() => {});
    getStudents({ size: 200 }).then((d) => setStudentList(d.content ?? d)).catch(() => {});
  }, []);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleStudentIds = (ids) =>
    setForm((f) => ({ ...f, studentIds: ids }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        name: form.name,
        code: form.code,
        facultyId: Number(form.facultyId),
        studentIds: form.studentIds,
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save course.');
    } finally {
      setSubmitting(false);
    }
  };

  return { form, submitting, error, facultyList, studentList, handleChange, handleStudentIds, handleSubmit };
};

export default useCourseForm;
