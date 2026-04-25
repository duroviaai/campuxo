import { useState } from 'react';
import { EMPTY_STUDENT_FORM, DEPARTMENTS } from '../utils/studentHelpers';
import { useGetAllClassesQuery, useGetSpecializationsQuery } from '../state/studentApi';

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white';

const SchemeBadge = ({ scheme }) => scheme ? (
  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
    scheme === 'NEP' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
  }`}>{scheme}</span>
) : null;

const StudentForm = ({ initialData, onSubmit }) => {
  const [form, setForm]         = useState({ ...EMPTY_STUDENT_FORM, ...initialData });
  const [selectedDept, setSelectedDept] = useState(initialData?.department ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState(null);

  const [selectedSpec, setSelectedSpec] = useState(initialData?.specialization ?? '');

  const { data: classes = [], isLoading: classesLoading } = useGetAllClassesQuery();

  // Fetch specializations for selected dept (skip if no dept selected)
  const { data: specializations = [] } = useGetSpecializationsQuery(
    selectedDept ? { department: selectedDept } : undefined,
    { skip: !selectedDept }
  );
  const hasSpecializations = specializations.length > 0;

  // Batches filtered by dept and (if applicable) specialization
  const deptBatches = classes.filter((c) => {
    if (c.name !== selectedDept) return false;
    if (hasSpecializations && selectedSpec) return c.specialization === selectedSpec;
    return true;
  });

  const selectedBatch = form.classBatchId
    ? classes.find((c) => c.id === Number(form.classBatchId))
    : null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'department') {
      setSelectedDept(value);
      setSelectedSpec('');
      setForm((f) => ({ ...f, department: value, classBatchId: '', scheme: '', specialization: '' }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleSpecSelect = (specName) => {
    setSelectedSpec(specName);
    setForm((f) => ({ ...f, specialization: specName, classBatchId: '', scheme: '' }));
  };

  const handleBatchSelect = (batchId) => {
    const batch = classes.find((c) => c.id === Number(batchId));
    setForm((f) => ({
      ...f,
      classBatchId: batchId,
      scheme: batch ? batch.scheme : '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        firstName:       form.firstName,
        lastName:        form.lastName,
        phone:           form.phone,
        department:      form.department,
        dateOfBirth:     form.dateOfBirth,
        classBatchId:    form.classBatchId ? Number(form.classBatchId) : null,
        yearOfStudy:     form.yearOfStudy  ? Number(form.yearOfStudy)  : null,
        scheme:          form.scheme || null,
        specialization:  selectedSpec || null,
        courseStartYear: form.courseStartYear ? Number(form.courseStartYear) : null,
        courseEndYear:   form.courseEndYear   ? Number(form.courseEndYear)   : null,
        photoUrl:        form.photoUrl,
      });
    } catch (err) {
      setError(err?.data?.message || err?.response?.data?.message || 'Failed to save student.');
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

        {selectedDept && hasSpecializations && (
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-xs font-semibold text-gray-600">Specialization<span className="text-red-500 ml-0.5">*</span></label>
            <div className="flex flex-wrap gap-2">
              {specializations.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSpecSelect(s.name)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    selectedSpec === s.name
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-600 hover:border-indigo-300'
                  }`}
                >
                  {s.name}
                  <span className={`ml-1.5 text-[10px] font-bold px-1 py-0.5 rounded-full ${
                    s.scheme === 'NEP' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-700'
                  }`}>{s.scheme}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedDept && (!hasSpecializations || selectedSpec) && (
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-xs font-semibold text-gray-600">Batch</label>
            {deptBatches.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">No batches found for {selectedDept}{selectedSpec ? ` (${selectedSpec})` : ''}. Ask admin to create one.</p>
            ) : (
              <select
                value={form.classBatchId ?? ''}
                onChange={(e) => handleBatchSelect(e.target.value)}
                className={inputCls}
              >
                <option value="">— Select batch —</option>
                {deptBatches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.startYear} – {b.endYear} ({b.scheme})
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {selectedBatch && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Scheme</label>
            <div className={`${inputCls} flex items-center gap-2`}>
              <SchemeBadge scheme={selectedBatch.scheme} />
              <span className="text-gray-400 text-xs">Auto-set from batch</span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-600">Year of Study</label>
          <select name="yearOfStudy" value={form.yearOfStudy ?? ''} onChange={handleChange} className={inputCls}>
            <option value="">— Select year —</option>
            {[1, 2, 3, 4].map((y) => (
              <option key={y} value={y}>{y === 1 ? '1st' : y === 2 ? '2nd' : y === 3 ? '3rd' : '4th'} Year</option>
            ))}
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
          disabled={submitting || classesLoading}
          className="px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-colors shadow-sm"
        >
          {submitting ? 'Saving...' : 'Save Student'}
        </button>
      </div>
    </form>
  );
};

export default StudentForm;
