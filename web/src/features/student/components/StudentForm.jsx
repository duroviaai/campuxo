import { useState, useEffect } from 'react';
import { EMPTY_STUDENT_FORM, DEPARTMENTS } from '../utils/studentHelpers';
import { getAllClasses } from '../services/studentService';

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white';

const StudentForm = ({ initialData, onSubmit }) => {
  const [form, setForm]           = useState({ ...EMPTY_STUDENT_FORM, ...initialData });
  const [classes, setClasses]     = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState(null);

  useEffect(() => {
    getAllClasses().then(setClasses).catch(() => {});
  }, []);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        ...form,
        classBatchId: form.classBatchId ? Number(form.classBatchId) : null,
        yearOfStudy:  form.yearOfStudy  ? Number(form.yearOfStudy)  : null,
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save student.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-600">First Name<span className="text-red-500 ml-0.5">*</span></label>
          <input name="firstName" required value={form.firstName ?? ''} onChange={handleChange} className={inputCls} />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-600">Last Name</label>
          <input name="lastName" value={form.lastName ?? ''} onChange={handleChange} className={inputCls} />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-600">Phone</label>
          <input name="phone" value={form.phone ?? ''} onChange={handleChange} className={inputCls} placeholder="e.g. 9876543210" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-600">Department</label>
          <select name="department" value={form.department ?? ''} onChange={handleChange} className={inputCls}>
            <option value="">— Select department —</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-600">Class / Batch</label>
          <select name="classBatchId" value={form.classBatchId ?? ''} onChange={handleChange} className={inputCls}>
            <option value="">— Select class —</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.displayName || `${c.name} Yr${c.year} Sec-${c.section}`}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-600">Year of Study</label>
          <select name="yearOfStudy" value={form.yearOfStudy ?? ''} onChange={handleChange} className={inputCls}>
            <option value="">— Select year —</option>
            {[1, 2, 3, 4].map((y) => <option key={y} value={y}>Year {y}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-600">Date of Birth</label>
          <input name="dateOfBirth" type="date" value={form.dateOfBirth ?? ''} onChange={handleChange} className={inputCls} />
        </div>

      </div>

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
