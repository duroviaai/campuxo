import { useState } from 'react';
import { createFaculty } from '../services/facultyService';
import { EMPTY_FACULTY_FORM } from '../utils/facultyHelpers';

const useFacultyForm = (onSuccess) => {
  const [form, setForm]           = useState(EMPTY_FACULTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState(null);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createFaculty(form);
      setForm(EMPTY_FACULTY_FORM);
      onSuccess?.();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save faculty.');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => { setForm(EMPTY_FACULTY_FORM); setError(null); };

  return { form, submitting, error, handleChange, handleSubmit, reset };
};

export default useFacultyForm;
