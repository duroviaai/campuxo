import { useState } from 'react';
import { EMPTY_FACULTY_FORM, DESIGNATIONS, QUALIFICATIONS } from '../utils/facultyHelpers';
import { useGetDepartmentsQuery } from '../../admin/courses/coursesAdminApi';

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white';
const labelCls = 'text-xs font-semibold text-gray-600';

const Field = ({ label, required, children }) => (
  <div className="flex flex-col gap-1">
    <label className={labelCls}>{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
    {children}
  </div>
);

const TABS = ['Basic Info', 'Academic Info'];

const FacultyForm = ({ initialData, onSubmit, onCancel }) => {
  const { data: departments = [] } = useGetDepartmentsQuery();
  const [tab, setTab] = useState(0);

  const merged = initialData
    ? {
        ...initialData,
        name: initialData.name ?? `${initialData.firstName ?? ''} ${initialData.lastName ?? ''}`.trim(),
        experience: initialData.experience ?? '',
        subjects: initialData.subjects ?? '',
        joiningDate: initialData.joiningDate ?? '',
        qualification: initialData.qualification ?? '',
      }
    : {};

  const [form, setForm] = useState({ ...EMPTY_FACULTY_FORM, ...merged });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const handle = (e) => set(e.target.name, e.target.value);

  const handleDept = (e) => {
    const name = e.target.value;
    const dept = departments.find((d) => d.name === name);
    setForm((f) => ({ ...f, department: name, departmentId: dept?.id ?? null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        ...form,
        experience: form.experience !== '' ? Number(form.experience) : null,
        joiningDate: form.joiningDate || null,
      });
    } catch (err) {
      setError(err?.data?.message || err?.response?.data?.message || 'Failed to save faculty.');
      setTab(0);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Tab switcher */}
      <div className="flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
        {TABS.map((t, i) => (
          <button key={t} type="button" onClick={() => setTab(i)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              tab === i ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab 0 — Basic Info */}
      {tab === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name" required>
            <input name="name" required value={form.name ?? ''} onChange={handle} className={inputCls} placeholder="e.g. Dr. Ravi Kumar" />
          </Field>

          <Field label="Faculty ID" required>
            <input name="facultyId" required value={form.facultyId ?? ''} onChange={handle} className={inputCls} placeholder="e.g. FAC001" />
          </Field>

          <Field label="Email" required>
            <input name="email" type="email" required value={form.email ?? ''} onChange={handle} className={inputCls} placeholder="faculty@college.edu" />
          </Field>

          <Field label="Phone">
            <input name="phone" value={form.phone ?? ''} onChange={handle} className={inputCls} placeholder="e.g. 9876543210" />
          </Field>

          <Field label="Department">
            <select name="department" value={form.department ?? ''} onChange={handleDept} className={inputCls}>
              <option value="">— Select department —</option>
              {departments.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
          </Field>

          <Field label="Designation">
            <select name="designation" value={form.designation ?? ''} onChange={handle} className={inputCls}>
              <option value="">— Select designation —</option>
              {DESIGNATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>

          <Field label="Joining Date">
            <input name="joiningDate" type="date" value={form.joiningDate ?? ''} onChange={handle} className={inputCls} />
          </Field>
        </div>
      )}

      {/* Tab 1 — Academic Info */}
      {tab === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Qualification">
            <select name="qualification" value={form.qualification ?? ''} onChange={handle} className={inputCls}>
              <option value="">— Select qualification —</option>
              {QUALIFICATIONS.map((q) => <option key={q} value={q}>{q}</option>)}
            </select>
          </Field>

          <Field label="Experience (years)">
            <input name="experience" type="number" min="0" max="50" value={form.experience ?? ''} onChange={handle}
              className={inputCls} placeholder="e.g. 5" />
          </Field>

          <Field label="Subjects Handled">
            <input name="subjects" value={form.subjects ?? ''} onChange={handle}
              className={inputCls} placeholder="e.g. Data Structures, DBMS, OS" />
            <p className="text-[10px] text-gray-400 mt-0.5">Comma-separated list of subjects</p>
          </Field>
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex justify-between items-center pt-1">
        <div className="flex gap-2">
          {tab > 0 && (
            <button type="button" onClick={() => setTab(tab - 1)}
              className="px-4 py-2 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
              ← Back
            </button>
          )}
          {tab < TABS.length - 1 && (
            <button type="button" onClick={() => setTab(tab + 1)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700">
              Next →
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {onCancel && (
            <button type="button" onClick={onCancel}
              className="px-4 py-2 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
          )}
          <button type="submit" disabled={submitting}
            className="px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-colors">
            {submitting ? 'Saving…' : 'Save Faculty'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default FacultyForm;
