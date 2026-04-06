import { useState } from 'react';
import { createStudent } from '../services/studentService';
import { EMPTY_STUDENT_FORM } from '../utils/studentHelpers';

const useStudentForm = (onSuccess) => {
  const [form, setForm] = useState(EMPTY_STUDENT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createStudent(form);
      setForm(EMPTY_STUDENT_FORM);
      onSuccess?.();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save student.');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => { setForm(EMPTY_STUDENT_FORM); setError(null); };

  return { form, submitting, error, handleChange, handleSubmit, reset };
};

export default useStudentForm;
