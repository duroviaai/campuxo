import { useState } from 'react';
import { EMPTY_STUDENT_FORM } from '../utils/studentHelpers';

const FIELDS = [
  { name: 'name',               label: 'Full Name',           required: true },
  { name: 'email',              label: 'Email',               required: true, type: 'email' },
  { name: 'registrationNumber', label: 'Registration Number', required: true },
];

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white';

const StudentForm = ({ initialData, onSubmit }) => {
  const [form, setForm] = useState({ ...EMPTY_STUDENT_FORM, ...initialData });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save student.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {FIELDS.map(({ name, label, required, type = 'text' }) => (
        <div key={name} className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-600">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
          <input
            name={name}
            type={type}
            required={required}
            value={form[name]}
            onChange={handleChange}
            className={inputCls}
          />
        </div>
      ))}
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex justify-end pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-colors shadow-sm"
        >
          {submitting ? 'Saving...' : 'Save Student'}
        </button>
      </div>
    </form>
  );
};

export default StudentForm;
