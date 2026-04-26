import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateMyProfile, createStudent } from '../services/studentService';
import { getUser, setUser } from '../../../shared/utils/tokenUtils';
import { useAuthContext } from '../../../app/providers/AuthProvider';
import { useGetAllDepartmentsQuery, useGetBatchesByDepartmentQuery, useGetSpecializationsQuery } from '../state/studentApi';
import ROUTES from '../../../app/routes/routeConstants';

const STEPS = ['Personal Info', 'Academic Info', 'Review & Submit'];

const inp = 'w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition hover:border-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white';

const Field = ({ label, required, children }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-gray-700">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const CompleteProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuthContext();
  const { data: departments = [] } = useGetAllDepartmentsQuery();
  const deptNames = departments.map((d) => d.name);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSpec, setSelectedSpec] = useState('');

  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', dateOfBirth: '',
    department: '', classBatchId: '', yearOfStudy: '',
    scheme: '', courseStartYear: '', courseEndYear: '',
  });

  const { data: specializations = [] } = useGetSpecializationsQuery(
    form.department ? { department: form.department } : undefined,
    { skip: !form.department }
  );
  const { data: deptBatches = [] } = useGetBatchesByDepartmentQuery(form.department, { skip: !form.department });
  const hasSpecializations = specializations.length > 0;

  const filteredBatches = deptBatches.filter((c) => {
    if (hasSpecializations && selectedSpec) return c.specialization === selectedSpec;
    return true;
  });
  const selectedBatch = form.classBatchId ? deptBatches.find((c) => c.id === Number(form.classBatchId)) : null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'department') {
      setForm((f) => ({ ...f, department: value, classBatchId: '', scheme: '' }));
      setSelectedSpec('');
    } else if (name === 'classBatchId') {
      const batch = deptBatches.find((c) => c.id === Number(value));
      setForm((f) => ({
        ...f, classBatchId: value,
        scheme: batch ? batch.scheme : '',
        courseStartYear: batch ? String(batch.startYear) : '',
        courseEndYear: batch ? String(batch.endYear) : '',
      }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const next = (e) => { e.preventDefault(); setError(null); setStep((s) => s + 1); };
  const back = () => setStep((s) => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      ...form,
      classBatchId: form.classBatchId ? Number(form.classBatchId) : null,
      yearOfStudy: form.yearOfStudy ? Number(form.yearOfStudy) : null,
      courseStartYear: Number(form.courseStartYear),
      courseEndYear: Number(form.courseEndYear),
      scheme: form.scheme || null,
      specialization: selectedSpec || null,
    };
    try {
      try { await createStudent(payload); } catch { await updateMyProfile(payload); }
      const stored = getUser();
      setUser({ ...stored, profileComplete: true });
      refreshUser();
      navigate(ROUTES.STUDENT_DASHBOARD, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-8 py-10">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">Complete your profile</h1>
            <p className="text-sm text-gray-500 mt-1">
              Welcome, <span className="font-medium text-gray-700">{user?.username}</span>. Fill in your details to get started.
            </p>
          </div>

          {/* Stepper */}
          <div className="flex items-center mb-8">
            {STEPS.map((label, i) => (
              <div key={i} className="flex-1 flex flex-col items-center relative">
                {i < STEPS.length - 1 && (
                  <div className={`absolute top-4 left-1/2 w-full h-0.5 transition-colors ${i < step ? 'bg-indigo-500' : 'bg-gray-200'}`} />
                )}
                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  i < step ? 'bg-indigo-600 text-white' :
                  i === step ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {i < step ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : i + 1}
                </div>
                <span className={`text-xs font-medium mt-1.5 ${i === step ? 'text-indigo-600' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              {error}
            </div>
          )}

          {/* Step 0 — Personal Info */}
          {step === 0 && (
            <form onSubmit={next} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Field label="First Name" required>
                  <input name="firstName" value={form.firstName} onChange={handleChange} required placeholder="John" className={inp} />
                </Field>
                <Field label="Last Name">
                  <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Doe" className={inp} />
                </Field>
              </div>
              <Field label="Phone Number" required>
                <input name="phone" value={form.phone} onChange={handleChange} required placeholder="9876543210" className={inp} />
              </Field>
              <Field label="Date of Birth" required>
                <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} required max={new Date().toISOString().split('T')[0]} className={inp} />
              </Field>
              <div className="flex items-center justify-between pt-1">
                <button type="button" onClick={() => logout()} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                  Sign out
                </button>
                <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors">
                  Continue
                </button>
              </div>
            </form>
          )}

          {/* Step 1 — Academic Info */}
          {step === 1 && (
            <form onSubmit={next} className="space-y-5">
              <Field label="Department" required>
                <select name="department" value={form.department} onChange={handleChange} required className={inp}>
                  <option value="">Select your department</option>
                  {deptNames.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>

              {form.department && hasSpecializations && (
                <Field label="Specialization" required>
                  <div className="flex flex-wrap gap-2 pt-0.5">
                    {specializations.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => { setSelectedSpec(s.name); setForm((f) => ({ ...f, classBatchId: '', scheme: '' })); }}
                        className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                          selectedSpec === s.name
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-300 text-gray-600 hover:border-indigo-400 hover:bg-gray-50'
                        }`}
                      >
                        {s.name}
                        <span className={`ml-2 text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                          s.scheme === 'NEP' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-700'
                        }`}>{s.scheme}</span>
                      </button>
                    ))}
                  </div>
                </Field>
              )}

              {form.department && (!hasSpecializations || selectedSpec) && (
                <Field label="Batch" required>
                  {filteredBatches.length === 0 ? (
                    <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                      </svg>
                      No batches found for {form.department}{selectedSpec ? ` — ${selectedSpec}` : ''}. Please contact admin.
                    </div>
                  ) : (
                    <select name="classBatchId" value={form.classBatchId} onChange={handleChange} required className={inp}>
                      <option value="">Select your batch</option>
                      {filteredBatches.map((b) => (
                        <option key={b.id} value={b.id}>{b.displayName || `${b.startYear} – ${b.endYear} (${b.scheme})`}</option>
                      ))}
                    </select>
                  )}
                </Field>
              )}

              {selectedBatch && (
                <Field label="Scheme">
                  <div className="flex items-center gap-2.5 px-3.5 py-2.5 border border-gray-200 rounded-lg bg-gray-50">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      selectedBatch.scheme === 'NEP' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
                    }`}>{selectedBatch.scheme}</span>
                    <span className="text-sm text-gray-400">Auto-filled from selected batch</span>
                  </div>
                </Field>
              )}

              <Field label="Year of Study" required>
                <select name="yearOfStudy" value={form.yearOfStudy} onChange={handleChange} required className={inp}>
                  <option value="">Select current year</option>
                  {[1, 2, 3].map((y) => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </Field>

              <div className="flex items-center justify-between pt-1">
                <button type="button" onClick={back} className="px-4 py-2.5 text-sm font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700">
                  ← Back
                </button>
                <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors">
                  Continue
                </button>
              </div>
            </form>
          )}

          {/* Step 2 — Review */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                {[
                  ['First Name',        form.firstName],
                  ['Last Name',         form.lastName || '—'],
                  ['Phone',             form.phone],
                  ['Date of Birth',     form.dateOfBirth],
                  ['Department',        form.department],
                  ['Specialization',    selectedSpec || '—'],
                  ['Batch',             selectedBatch ? `${selectedBatch.startYear} – ${selectedBatch.endYear}` : '—'],
                  ['Scheme',            form.scheme || '—'],
                  ['Year of Study',     form.yearOfStudy ? `Year ${form.yearOfStudy}` : '—'],
                ].map(([label, value], i, arr) => (
                  <div key={label} className={`flex items-center justify-between px-4 py-3 ${i < arr.length - 1 ? 'border-b border-gray-100' : ''} ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
                    <span className="text-sm font-medium text-gray-800">{value}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-400 text-center">
                You can update these details anytime from your profile page.
              </p>

              <div className="flex items-center justify-between pt-1">
                <button type="button" onClick={back} className="px-4 py-2.5 text-sm font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700">
                  ← Back
                </button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors">
                  {saving ? 'Saving…' : 'Complete Profile'}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default CompleteProfilePage;
