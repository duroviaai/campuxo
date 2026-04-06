import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFaculty } from '../../faculty/services/facultyService';
import { getAllClasses } from '../../student/services/studentService';
import { EMPTY_COURSE_FORM } from '../utils/courseHelpers';
import ROUTES from '../../../app/routes/routeConstants';

const DEPARTMENTS = ['BCA', 'BSc', 'BCom', 'BA'];

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white';

const CourseForm = ({ initialData = EMPTY_COURSE_FORM, onSubmit }) => {
  const navigate = useNavigate();
  const [form, setForm]             = useState({ ...EMPTY_COURSE_FORM, ...initialData });
  const [facultyList, setFacultyList] = useState([]);
  const [classes, setClasses]       = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState(null);

  useEffect(() => {
    if (!initialData?.facultyName) {
      getFaculty({ size: 200 }).then((d) => setFacultyList(d.content ?? d)).catch(() => {});
    }
    getAllClasses().then(setClasses).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => {
      const updated = { ...f, [name]: value };
      if (name === 'programType') { updated.classBatchId = ''; }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        name:        form.name,
        code:        form.code,
        credits:     form.credits ? Number(form.credits) : null,
        programType: form.programType || null,
        facultyId:   form.facultyId ? Number(form.facultyId) : Number(initialData?.facultyId),
        classBatchId: form.classBatchId ? Number(form.classBatchId) : null,
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save course.');
    } finally {
      setSubmitting(false);
    }
  };

return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="text-xs font-semibold text-gray-600">Department<span className="text-red-500 ml-0.5">*</span></label>
          <select name="programType" required value={form.programType} onChange={handleChange} className={inputCls}>
            <option value="">— Select department —</option>
            {DEPARTMENTS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {form.programType && (
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-xs font-semibold text-gray-600">Class / Batch<span className="text-red-500 ml-0.5">*</span></label>
            {classes.length === 0 ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                No classes found.
                <button type="button" onClick={() => navigate(ROUTES.ADMIN_CLASSES)} className="underline font-semibold ml-1">
                  Create a class first →
                </button>
              </div>
            ) : (
              <select name="classBatchId" required value={form.classBatchId ?? ''} onChange={handleChange} className={inputCls}>
                <option value="">— Select class —</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.displayName || `${c.name} Year ${c.year} - Sec ${c.section}`}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {form.programType && (
          <>
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-xs font-semibold text-gray-600">Course Name<span className="text-red-500 ml-0.5">*</span></label>
              <input name="name" required value={form.name} onChange={handleChange} className={inputCls} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Course Code<span className="text-red-500 ml-0.5">*</span></label>
              <input name="code" required value={form.code} onChange={handleChange} className={inputCls} placeholder="e.g. CS101" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Credits</label>
              <input name="credits" type="number" min="1" max="10" value={form.credits} onChange={handleChange} className={inputCls} placeholder="e.g. 4" />
            </div>

            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-xs font-semibold text-gray-600">Faculty</label>
              {initialData?.facultyName ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
                  {initialData.facultyName}
                  <span className="text-xs text-gray-400 ml-1">(assigned)</span>
                </div>
              ) : (
                <select name="facultyId" required value={form.facultyId} onChange={handleChange} className={inputCls}>
                  <option value="">— Select faculty —</option>
                  {facultyList.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.fullName || f.name || f.email}
                      {f.department ? ` (${f.department})` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </>
        )}

      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex justify-end pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-colors shadow-sm"
        >
          {submitting ? 'Saving...' : 'Save Course'}
        </button>
      </div>
    </form>
  );
};

export default CourseForm;
