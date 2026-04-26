import { useState } from 'react';
import { EMPTY_STUDENT_FORM } from '../utils/studentHelpers';
import {
  useGetBatchesQuery,
  useGetDepartmentsQuery,
  useGetSpecializationsByDeptQuery,
  useGetClassStructureQuery,
  useGetOrCreateClassStructureMutation,
} from '../../admin/courses/coursesAdminApi';
import toast from 'react-hot-toast';

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white';

// ─── Semester picker (inline, no navigation) ──────────────────────────────────
const YEAR_GROUPS = [
  { year: 1, label: 'Year 1', sems: [1, 2] },
  { year: 2, label: 'Year 2', sems: [3, 4] },
  { year: 3, label: 'Year 3', sems: [5, 6] },
];

const SemesterPicker = ({ batch, dept, spec, onSelect }) => {
  const { data: structures = [], isLoading } = useGetClassStructureQuery(
    { batchId: batch.id, deptId: dept.id, specId: spec?.id ?? undefined },
    { skip: !batch.id || !dept.id }
  );
  const [getOrCreate, { isLoading: creating }] = useGetOrCreateClassStructureMutation();

  const existingMap = Object.fromEntries(
    structures.map((cs) => [`${cs.yearOfStudy}-${cs.semester}`, cs])
  );

  const handleClick = async (yearOfStudy, semester) => {
    const key = `${yearOfStudy}-${semester}`;
    if (existingMap[key]) { onSelect(existingMap[key]); return; }
    try {
      const cs = await getOrCreate({
        batchId: batch.id, departmentId: dept.id,
        specializationId: spec?.id ?? null, yearOfStudy, semester,
      }).unwrap();
      onSelect(cs);
    } catch { toast.error('Failed to open semester.'); }
  };

  if (isLoading) return <p className="text-xs text-gray-400">Loading semesters…</p>;

  return (
    <div className="space-y-3">
      {YEAR_GROUPS.map(({ year, label, sems }) => (
        <div key={year}>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">{label}</p>
          <div className="grid grid-cols-2 gap-2">
            {sems.map((sem) => {
              const exists = !!existingMap[`${year}-${sem}`];
              return (
                <button key={sem} type="button" onClick={() => handleClick(year, sem)} disabled={creating}
                  className={`py-3 rounded-xl border-2 text-xs font-bold transition-all disabled:opacity-50 ${
                    exists
                      ? 'border-indigo-400 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                      : 'border-dashed border-gray-200 text-gray-400 hover:border-indigo-300 hover:text-indigo-600'
                  }`}>
                  Sem {sem}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Class picker: Batch → Dept → Semester ────────────────────────────────────
const ClassPicker = ({ onResolved }) => {
  const [batch, setBatch] = useState(null);
  const [dept, setDept]   = useState(null);
  const [spec, setSpec]   = useState(null);
  const [resolving, setResolving] = useState(false);

  const { data: batches = [], isLoading: batchLoading } = useGetBatchesQuery();
  const { data: depts = [],   isLoading: deptLoading  } = useGetDepartmentsQuery();
  const { data: specs = [] } = useGetSpecializationsByDeptQuery(
    { deptId: dept?.id, scheme: batch?.scheme },
    { skip: !dept?.id }
  );

  const handleSemesterSelect = async (cs) => {
    setResolving(true);
    try {
      onResolved({
        classStructureId: cs.id,
        department:       dept.name,
        scheme:           batch.scheme,
        yearOfStudy:      cs.yearOfStudy,
        displayLabel:     `${dept.name} · ${batch.startYear}–${batch.endYear} (${batch.scheme}) · Y${cs.yearOfStudy} Sem ${cs.semester}`,
      });
    } finally { setResolving(false); }
  };

  if (batchLoading || deptLoading) return <p className="text-xs text-gray-400">Loading…</p>;

  return (
    <div className="space-y-3 border border-gray-200 rounded-xl p-4 bg-gray-50">
      {/* Batch */}
      <div>
        <label className="text-xs font-semibold text-gray-600 block mb-1">Batch *</label>
        <div className="flex flex-wrap gap-2">
          {batches.map((b) => (
            <button key={b.id} type="button"
              onClick={() => { setBatch(b); setDept(null); setSpec(null); }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                batch?.id === b.id
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 text-gray-600 hover:border-indigo-300'
              }`}>
              {b.startYear}–{b.endYear}
              <span className={`ml-1.5 text-[10px] font-bold px-1 py-0.5 rounded-full ${
                b.scheme === 'NEP' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-700'
              }`}>{b.scheme}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Department */}
      {batch && (
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">Department *</label>
          <div className="flex flex-wrap gap-2">
            {depts.map((d) => (
              <button key={d.id} type="button"
                onClick={() => { setDept(d); setSpec(null); }}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                  dept?.id === d.id
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 text-gray-600 hover:border-indigo-300'
                }`}>
                {d.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Specialization */}
      {batch && dept && specs.length > 0 && (
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">Specialization</label>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setSpec(null)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                !spec ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-indigo-300'
              }`}>All</button>
            {specs.map((s) => (
              <button key={s.id} type="button" onClick={() => setSpec(s)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                  spec?.id === s.id
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 text-gray-600 hover:border-indigo-300'
                }`}>
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Semester */}
      {batch && dept && (
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">Semester *</label>
          {resolving
            ? <p className="text-xs text-gray-400">Resolving class…</p>
            : <SemesterPicker batch={batch} dept={dept} spec={spec} onSelect={handleSemesterSelect} />
          }
        </div>
      )}
    </div>
  );
};

// ─── Main form ────────────────────────────────────────────────────────────────
const StudentForm = ({ initialData, onSubmit }) => {
  const [form, setForm]         = useState({ ...EMPTY_STUDENT_FORM, ...initialData });
  const [classLabel, setClassLabel] = useState(
    initialData?.classBatchDisplayName ?? initialData?.classBatchName ?? ''
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleResolved = ({ classStructureId, department, scheme, yearOfStudy, displayLabel }) => {
    setForm((f) => ({ ...f, classStructureId, department, scheme, yearOfStudy }));
    setClassLabel(displayLabel);
    setShowPicker(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError(null);
    try {
      await onSubmit({
        firstName:        form.firstName,
        lastName:         form.lastName,
        phone:            form.phone,
        department:       form.department,
        dateOfBirth:      form.dateOfBirth || null,
        classStructureId: form.classStructureId ? Number(form.classStructureId) : null,
        classBatchId:     form.classStructureId ? null : (form.classBatchId ? Number(form.classBatchId) : null),
        yearOfStudy:      form.yearOfStudy  ? Number(form.yearOfStudy)  : null,
        scheme:           form.scheme       || null,
        courseStartYear:  form.courseStartYear ? Number(form.courseStartYear) : null,
        courseEndYear:    form.courseEndYear   ? Number(form.courseEndYear)   : null,
        photoUrl:         form.photoUrl     || null,
      });
    } catch (err) {
      setError(err?.data?.message || 'Failed to save student.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-600">First Name *</label>
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
          <label className="text-xs font-semibold text-gray-600">Date of Birth</label>
          <input name="dateOfBirth" type="date" value={form.dateOfBirth ?? ''} onChange={handleChange} className={inputCls} />
        </div>

      </div>

      {/* Class assignment */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-600">Class Assignment</label>
        {classLabel ? (
          <div className="flex items-center gap-2">
            <span className="flex-1 border border-indigo-300 bg-indigo-50 text-indigo-700 rounded-lg px-3 py-2 text-xs font-semibold">
              {classLabel}
            </span>
            <button type="button" onClick={() => setShowPicker((v) => !v)}
              className="px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
              Change
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setShowPicker((v) => !v)}
            className="w-full border border-dashed border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-400 hover:border-indigo-400 hover:text-indigo-600 transition-colors text-left">
            + Select Batch → Department → Semester
          </button>
        )}
        {showPicker && <ClassPicker onResolved={handleResolved} />}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex justify-end pt-1">
        <button type="submit" disabled={submitting}
          className="px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-colors shadow-sm">
          {submitting ? 'Saving…' : 'Save Student'}
        </button>
      </div>
    </form>
  );
};

export default StudentForm;
