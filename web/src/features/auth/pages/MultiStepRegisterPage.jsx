import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import {
  FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash,
  FaPhone, FaIdCard, FaBuilding, FaChalkboardTeacher,
  FaGraduationCap, FaCalendarAlt, FaBriefcase, FaUniversity,
  FaGoogle, FaArrowLeft, FaCheckCircle, FaExclamationCircle, FaTags,
} from 'react-icons/fa';
import useAuth from '../hooks/useAuth';
import ROUTES from '../../../app/routes/routeConstants';
import httpClient from '../../../services/httpClient';

const inp = (err) =>
  `w-full border rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-150 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 shadow-sm ${
    err ? 'border-red-400 bg-red-50 focus:ring-red-300' : 'border-gray-200 bg-white hover:border-gray-300'
  }`;

const inpNoIcon = (err) =>
  `w-full border rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-150 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 shadow-sm ${
    err ? 'border-red-400 bg-red-50 focus:ring-red-300' : 'border-gray-200 bg-white hover:border-gray-300'
  }`;

const IconInput = ({ icon: Icon, children }) => (
  <div className="relative">
    <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 pointer-events-none" />
    {children}
  </div>
);

const F = ({ label, error, required, children }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold text-gray-600 tracking-wide">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
    {error && (
      <p className="flex items-center gap-1 text-[11px] text-red-500">
        <span className="inline-block w-1 h-1 rounded-full bg-red-400" />{error}
      </p>
    )}
  </div>
);

const Btns = ({ onBack, onNext, loading, success, submitLabel }) => (
  <div className="flex gap-2.5 pt-2">
    {onBack && (
      <button type="button" onClick={onBack} disabled={loading}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 transition-all duration-150 shadow-sm">
        <FaArrowLeft className="w-3 h-3" /> Back
      </button>
    )}
    {onNext ? (
      <button type="button" onClick={onNext}
        className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-sm font-semibold rounded-xl py-2.5 transition-all duration-150 shadow-sm shadow-indigo-200">
        Continue
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    ) : (
      <button type="submit" disabled={loading || !!success}
        className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60 text-white text-sm font-semibold rounded-xl py-2.5 transition-all duration-150 shadow-sm shadow-indigo-200">
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Submitting…
          </>
        ) : submitLabel || 'Submit'}
      </button>
    )}
  </div>
);

// Step indices
const STEP_METHOD   = 0;
const STEP_PERSONAL = 1;
const STEP_ROLE     = 2;
const STEP_PROFILE  = 3;
const STEP_ACADEMIC = 4;
const STEP_PASSWORD = 5;

const ALL_STEP_LABELS = ['Method', 'Personal', 'Role', 'Profile', 'Academic', 'Password'];

// mode: 'complete' | 'google' | 'email' | null
function getActiveSteps(mode) {
  if (mode === 'complete') return [STEP_ROLE, STEP_PROFILE, STEP_ACADEMIC];
  if (mode === 'google')   return [STEP_ROLE, STEP_PROFILE, STEP_ACADEMIC];
  if (mode === 'email')    return [STEP_PERSONAL, STEP_ROLE, STEP_PROFILE, STEP_ACADEMIC, STEP_PASSWORD];
  return [STEP_METHOD];
}

export default function MultiStepRegisterPage() {
  const { registerUser, googlePrefill, googleRegisterUser, completeProfileUser, user: authUser, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Derive initial mode from location.state (Google new-user flow) or auth context (complete-profile flow).
  // location.state takes priority — a new Google user must never be treated as complete-profile.
  const locationState = location.state;
  const isGoogleFlow    = !!(locationState?.googleAccessToken);
  const isCompleteMode  = !isGoogleFlow && !!(token && authUser?.profileComplete === false);

  const [mode, setMode] = useState(() => {
    if (isGoogleFlow)   return 'google';
    if (isCompleteMode) return 'complete';
    return null;
  });
  const [googleAccessToken, setGoogleAccessToken] = useState(() => locationState?.googleAccessToken ?? null);
  const [step, setStep] = useState(() => (isGoogleFlow || isCompleteMode) ? STEP_ROLE : STEP_METHOD);
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [classStructures, setClassStructures] = useState([]);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [form, setForm] = useState(() => ({
    fullName: locationState?.prefill?.fullName ?? authUser?.username ?? '',
    email:    locationState?.prefill?.email    ?? authUser?.email    ?? '',
    role: '',
    registrationNumber: '', phone: '', dateOfBirth: '',
    department: '', yearOfStudy: '', batchId: '', classStructureId: '',
    scheme: '', specializationId: '',
    facultyId: '', designation: '', qualification: '', experience: '', joiningDate: '',
    password: '', confirmPassword: '',
  }));
  const [fe, setFe] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState({ password: false, confirmPassword: false });
  const [specializations, setSpecializations] = useState([]);
  const [openWindows, setOpenWindows] = useState([]);
  const [windowsLoading, setWindowsLoading] = useState(false);

  useEffect(() => {
    httpClient.get('/api/v1/departments').then((r) => setDepartments(r.data)).catch(() => {});
    httpClient.get('/api/v1/batches').then((r) => setBatches(r.data)).catch(() => {});
    if (locationState?.googleAccessToken) {
      window.history.replaceState({}, '');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!form.role) return;
    setWindowsLoading(true);
    httpClient.get('/api/v1/registration-windows/open', { params: { role: form.role } })
      .then((r) => setOpenWindows(r.data))
      .catch(() => setOpenWindows([]))
      .finally(() => setWindowsLoading(false));
  }, [form.role]);

  useEffect(() => {
    if (!form.department || !form.scheme) { setSpecializations([]); return; }
    httpClient.get('/api/v1/specializations', {
      params: { department: form.department, scheme: form.scheme },
    }).then((r) => setSpecializations(r.data)).catch(() => setSpecializations([]));
  }, [form.department, form.scheme]);

const deptId = departments.find((d) => d.name === form.department)?.id;

  useEffect(() => {
    if (!form.batchId || !deptId) { setClassStructures([]); return; }
    httpClient.get('/api/v1/class-structure/public', {
      params: { batchId: form.batchId, deptId, specId: form.specializationId || undefined },
    }).then((r) => {
      setClassStructures(r.data);
      if (r.data.length === 1) setForm((f) => ({ ...f, classStructureId: String(r.data[0].id) }));
    }).catch(() => setClassStructures([]));
  }, [form.batchId, deptId, form.specializationId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle navigation state from LoginPage (new Google user) — kept for safety but
  // initialization above already handles it synchronously via useState initialisers.
  // This effect only runs if somehow state arrives after mount (shouldn't happen).
  useEffect(() => {
    const state = location.state;
    if (state?.googleAccessToken && mode !== 'google') {
      setGoogleAccessToken(state.googleAccessToken);
      if (state.prefill?.fullName) setForm((f) => ({ ...f, fullName: state.prefill.fullName }));
      if (state.prefill?.email)    setForm((f) => ({ ...f, email: state.prefill.email }));
      setMode('google');
      setStep(STEP_ROLE);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const togglePw = (k) => setShowPw((v) => ({ ...v, [k]: !v[k] }));
  const yearOpts = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 3 + i);

  const activeSteps = getActiveSteps(mode);
  const currentIndex = activeSteps.indexOf(step);
  const isLastStep = currentIndex === activeSteps.length - 1;

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setError(null);
      try {
        const res = await googlePrefill(tokenResponse.access_token);
        if (res.username) setForm((f) => ({ ...f, fullName: res.username }));
        if (res.email)    setForm((f) => ({ ...f, email: res.email }));
        setGoogleAccessToken(tokenResponse.access_token);
        setMode('google');
        setStep(STEP_ROLE);
      } catch (err) {
        setError(err?.response?.data?.message || 'Google sign-in failed.');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => setError('Google sign-in failed.'),
  });

  const validators = {
    [STEP_PERSONAL]: () => {
      const e = {};
      if (!form.fullName.trim()) e.fullName = 'Full name is required';
      if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email is required';
      return e;
    },
    [STEP_ROLE]: () => {
      if (!form.role) return { role: 'Please select a role' };
      if (windowsLoading) return { role: 'Checking registration status…' };
      if (form.role === 'ROLE_STUDENT' && openWindows.length === 0)
        return { role: 'Student registration is currently closed. Please contact the admin.' };
      if (form.role === 'ROLE_FACULTY' && openWindows.length === 0)
        return { role: 'Faculty registration is currently closed. Please contact the admin.' };
      return {};
    },
    [STEP_PROFILE]: () => {
      const e = {};
      if (form.role === 'ROLE_STUDENT') {
        if (!form.registrationNumber.trim()) e.registrationNumber = 'Registration number is required';
        if (!form.phone.trim()) e.phone = 'Phone number is required';
        if (!form.department) e.department = 'Department is required';
      }
      if (form.role === 'ROLE_FACULTY') {
        if (!form.facultyId.trim()) e.facultyId = 'Faculty ID is required';
        if (!form.phone.trim()) e.phone = 'Phone number is required';
        if (!form.department) e.department = 'Department is required';
        if (!form.designation.trim()) e.designation = 'Designation is required';
      }
      return e;
    },
    [STEP_ACADEMIC]: () => {
      const e = {};
      if (form.role === 'ROLE_STUDENT') {
        if (!form.dateOfBirth) e.dateOfBirth = 'Date of birth is required';
        if (!form.yearOfStudy) e.yearOfStudy = 'Year of study is required';
        if (!form.batchId) e.batchId = 'Please select your batch';
      }
      if (form.role === 'ROLE_FACULTY') {
        if (!form.qualification?.trim()) e.qualification = 'Qualification is required';
        if (!form.joiningDate) e.joiningDate = 'Joining date is required';
      }
      return e;
    },
    [STEP_PASSWORD]: () => {
      const e = {};
      if (form.password.length < 6) e.password = 'Minimum 6 characters';
      if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
      return e;
    },
  };

  const next = () => {
    const errors = validators[step] ? validators[step]() : {};
    if (Object.keys(errors).length) { setFe(errors); return; }
    setFe({}); setError(null);
    const nextStep = activeSteps[currentIndex + 1];
    if (nextStep !== undefined) setStep(nextStep);
  };

  const back = () => {
    setFe({}); setError(null);
    const prevStep = activeSteps[currentIndex - 1];
    if (prevStep !== undefined) {
      setStep(prevStep);
    } else if (mode !== 'complete') {
      setStep(STEP_METHOD);
      setMode(null);
    }
  };

  const redirectByRole = (roles) => {
    if (roles?.includes('ROLE_ADMIN'))   navigate(ROUTES.ADMIN_DASHBOARD,   { replace: true });
    else if (roles?.includes('ROLE_FACULTY')) navigate(ROUTES.FACULTY_DASHBOARD, { replace: true });
    else navigate(ROUTES.STUDENT_DASHBOARD, { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLastStep) { next(); return; }  // guard: only submit on the final step
    const errors = validators[step] ? validators[step]() : {};
    if (Object.keys(errors).length) { setFe(errors); return; }
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      Object.keys(payload).forEach((k) => { if (payload[k] === '') payload[k] = null; });
      if (payload.specializationId) payload.specializationId = Number(payload.specializationId);
      if (payload.batchId) payload.batchId = Number(payload.batchId);
      if (payload.classStructureId) payload.classStructureId = Number(payload.classStructureId);

      if (mode === 'complete') {
        // Authenticated user completing their profile
        const res = await completeProfileUser(payload);
        setSuccess('Profile completed! Redirecting…');
        setTimeout(() => redirectByRole(res.roles), 1500);
      } else if (mode === 'google') {
        await googleRegisterUser(googleAccessToken, payload);
        setSuccess('Registration submitted! Awaiting admin approval.');
        setTimeout(() => navigate(ROUTES.LOGIN), 3000);
      } else {
        await registerUser(payload);
        setSuccess('Registration submitted! Awaiting admin approval.');
        setTimeout(() => navigate(ROUTES.LOGIN), 3000);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deptSelect = (name, val, err) => (
    <div className="relative">
      <FaBuilding className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 pointer-events-none" />
      <select name={name} value={val} onChange={set} className={inp(err) + ' appearance-none'}>
        <option value="">Select department</option>
        {departments.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
      </select>
    </div>
  );

  const pwInput = (name, label, placeholder) => (
    <F label={label} error={fe[name]} required>
      <div className="relative">
        <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 pointer-events-none" />
        <input
          type={showPw[name] ? 'text' : 'password'}
          name={name} value={form[name]}
          onChange={set} autoComplete="new-password"
          placeholder={placeholder}
          className={inp(fe[name]) + ' pr-9'}
        />
        <button type="button" onClick={() => togglePw(name)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
          {showPw[name] ? <FaEyeSlash className="w-3.5 h-3.5" /> : <FaEye className="w-3.5 h-3.5" />}
        </button>
      </div>
    </F>
  );

  // Steps visible in the progress bar (exclude method step)
  const visibleSteps = activeSteps.filter((s) => s !== STEP_METHOD);
  const visibleStepLabels = visibleSteps.map((s) => ALL_STEP_LABELS[s]);
  const visibleCurrentIndex = visibleSteps.indexOf(step);

  const stepContent = {
    [STEP_METHOD]: (
      <div className="space-y-3 pt-1">
        <button type="button" onClick={() => googleLogin()} disabled={googleLoading}
          className="w-full flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-700 bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md hover:-translate-y-px active:scale-[0.99] disabled:opacity-60 transition-all duration-150 shadow-sm">
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="flex-1 text-left">
            <span className="block font-semibold text-gray-800">{googleLoading ? 'Connecting…' : 'Continue with Google'}</span>
            <span className="block text-xs text-gray-400 font-normal mt-0.5">Use your Google account</span>
          </span>
          {googleLoading && (
            <svg className="w-4 h-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          )}
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-[11px] text-gray-400 font-semibold tracking-widest uppercase">or</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <button type="button" onClick={() => { setMode('email'); setStep(STEP_PERSONAL); }}
          className="w-full flex items-center gap-3 border border-gray-200 bg-white rounded-xl px-4 py-3.5 text-sm font-medium text-gray-700 hover:border-gray-300 hover:shadow-md hover:-translate-y-px active:scale-[0.99] transition-all duration-150 shadow-sm">
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 shrink-0">
            <FaEnvelope className="w-4 h-4 text-indigo-500" />
          </span>
          <span className="flex-1 text-left">
            <span className="block font-semibold text-gray-800">Continue with Email</span>
            <span className="block text-xs text-gray-400 font-normal mt-0.5">Register with email & password</span>
          </span>
        </button>

        {error && (
          <div className="flex items-start gap-2.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <FaExclamationCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>
    ),

    [STEP_PERSONAL]: (
      <div className="space-y-3">
        <F label="Full Name" error={fe.fullName} required>
          <IconInput icon={FaUser}>
            <input name="fullName" value={form.fullName} onChange={set} placeholder="Your full name" className={inp(fe.fullName)} />
          </IconInput>
        </F>
        <F label="Email Address" error={fe.email} required>
          <IconInput icon={FaEnvelope}>
            <input name="email" type="email" value={form.email} onChange={set} placeholder="name@institution.edu" className={inp(fe.email)} />
          </IconInput>
        </F>
        <Btns onBack={back} onNext={next} />
      </div>
    ),

    [STEP_ROLE]: (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {[
            ['ROLE_STUDENT', FaGraduationCap, 'Student', 'Enroll as a student'],
            ['ROLE_FACULTY', FaChalkboardTeacher, 'Faculty', 'Join as faculty'],
          ].map(([val, Icon, label, sub]) => (
            <button key={val} type="button" onClick={() => setForm((f) => ({ ...f, role: val }))}
              className={`relative py-5 px-3 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all duration-150 ${
                form.role === val
                  ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-indigo-300 hover:shadow-sm hover:-translate-y-0.5'
              }`}>
              {form.role === val && (
                <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center">
                  <FaCheckCircle className="w-2.5 h-2.5 text-white" />
                </span>
              )}
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                form.role === val ? 'bg-indigo-600' : 'bg-gray-100'
              }`}>
                <Icon className={`w-5 h-5 ${form.role === val ? 'text-white' : 'text-gray-400'}`} />
              </span>
              <span className={`text-sm font-bold ${form.role === val ? 'text-indigo-700' : 'text-gray-700'}`}>{label}</span>
              <span className="text-[11px] text-gray-400 text-center leading-tight">{sub}</span>
            </button>
          ))}
        </div>
        {fe.role && <p className="text-xs text-red-500 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-400 inline-block" />{fe.role}</p>}
        <Btns onBack={mode !== 'complete' ? back : undefined} onNext={next} loading={windowsLoading && !!form.role} />
      </div>
    ),

    [STEP_PROFILE]: (
      <div className="space-y-3">
        {form.role === 'ROLE_STUDENT' && (<>
          <div className="grid grid-cols-2 gap-3">
            <F label="Reg. Number" error={fe.registrationNumber} required>
              <IconInput icon={FaIdCard}>
                <input name="registrationNumber" value={form.registrationNumber} onChange={set} placeholder="1RV21CS001" className={inp(fe.registrationNumber)} />
              </IconInput>
            </F>
            <F label="Phone" error={fe.phone} required>
              <IconInput icon={FaPhone}>
                <input name="phone" value={form.phone} onChange={set} placeholder="9876543210" className={inp(fe.phone)} />
              </IconInput>
            </F>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <F label="Department" error={fe.department} required>
              {deptSelect('department', form.department, fe.department)}
            </F>
          </div>
        </>)}
        {form.role === 'ROLE_FACULTY' && (<>
          <div className="grid grid-cols-2 gap-3">
            <F label="Faculty ID" error={fe.facultyId} required>
              <IconInput icon={FaIdCard}>
                <input name="facultyId" value={form.facultyId} onChange={set} placeholder="FAC2024001" className={inp(fe.facultyId)} />
              </IconInput>
            </F>
            <F label="Phone" error={fe.phone} required>
              <IconInput icon={FaPhone}>
                <input name="phone" value={form.phone} onChange={set} placeholder="9876543210" className={inp(fe.phone)} />
              </IconInput>
            </F>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <F label="Department" error={fe.department} required>
              {deptSelect('department', form.department, fe.department)}
            </F>
            <F label="Designation" error={fe.designation} required>
              <IconInput icon={FaBriefcase}>
                <input name="designation" value={form.designation} onChange={set} placeholder="Asst. Professor" className={inp(fe.designation)} />
              </IconInput>
            </F>
          </div>
        </>)}
        <Btns onBack={back} onNext={next} />
      </div>
    ),

    [STEP_ACADEMIC]: (
      <div className="space-y-3">
        {Object.keys(fe).length > 0 && (
          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            <FaExclamationCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Please fill in all required fields.</span>
          </div>
        )}
        {form.role === 'ROLE_STUDENT' && (<>
          {windowsLoading ? (
            <div className="space-y-2 py-4">
              {[1, 2].map((i) => <div key={i} className="h-10 rounded-xl bg-gray-100 animate-pulse" />)}
            </div>
          ) : openWindows.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                <FaExclamationCircle className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-sm font-semibold text-gray-700">Registration is currently closed.</p>
              <p className="text-xs text-gray-400">Please contact the admin to open a registration window.</p>
              <Btns onBack={back} />
            </div>
          ) : (<>
          <div className="grid grid-cols-2 gap-3">
            <F label="Date of Birth" error={fe.dateOfBirth} required>
              <IconInput icon={FaCalendarAlt}>
                <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={set}
                  max={new Date().toISOString().split('T')[0]} className={inp(fe.dateOfBirth)} />
              </IconInput>
            </F>
          </div>
          <F label="Batch" error={fe.batchId} required>
            <IconInput icon={FaCalendarAlt}>
              <select name="batchId" value={form.batchId}
                onChange={(e) => {
                  const win = openWindows.find((w) => String(w.batchId) === e.target.value);
                  const selected = batches.find((b) => String(b.id) === e.target.value);
                  setForm((f) => ({
                    ...f,
                    batchId: e.target.value,
                    classStructureId: '',
                    specializationId: '',
                    scheme: selected?.scheme ?? f.scheme,
                    yearOfStudy: win ? String(win.allowedYearOfStudy) : f.yearOfStudy,
                  }));
                }}
                className={inp(fe.batchId) + ' appearance-none'}>
                <option value="">Select batch</option>
                {openWindows.map((w) => (
                  <option key={w.batchId} value={w.batchId}>
                    {w.batchStartYear}–{w.batchEndYear} ({w.batchScheme})
                  </option>
                ))}
              </select>
            </IconInput>
          </F>
          {form.batchId && (() => {
            const win = openWindows.find((w) => String(w.batchId) === String(form.batchId));
            return win ? (
              <div className="flex items-center gap-2 text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl px-3.5 py-2.5">
                <FaUniversity className="w-3.5 h-3.5 shrink-0" />
                <span>You are registering as <strong>Year {win.allowedYearOfStudy}</strong> for the {win.batchStartYear}–{win.batchEndYear} batch</span>
              </div>
            ) : null;
          })()}
          {form.batchId && specializations.length > 0 && (
            <F label="Specialization (optional)">
              <div className="relative">
                <FaTags className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 pointer-events-none" />
                <select name="specializationId" value={form.specializationId} onChange={set} className={inp(false) + ' appearance-none'}>
                  <option value="">None / General</option>
                  {specializations.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </F>
          )}
          </>)}
        </>)}
        {form.role === 'ROLE_FACULTY' && (<>
          <F label="Qualification" error={fe.qualification} required>
            <IconInput icon={FaGraduationCap}>
              <input name="qualification" value={form.qualification} onChange={set} placeholder="e.g. M.Tech" className={inp(fe.qualification)} />
            </IconInput>
          </F>
          <div className="grid grid-cols-2 gap-3">
            <F label="Experience (yrs)">
              <input type="number" min="0" name="experience" value={form.experience} onChange={set} placeholder="e.g. 5" className={inpNoIcon(false)} />
            </F>
            <F label="Joining Date" error={fe.joiningDate} required>
              <input type="date" name="joiningDate" value={form.joiningDate} onChange={set}
                max={new Date().toISOString().split('T')[0]} className={inpNoIcon(fe.joiningDate)} />
            </F>
          </div>
        </>)}
        <Btns onBack={back} onNext={isLastStep ? undefined : next} loading={loading} success={success}
          submitLabel={mode === 'complete' ? 'Complete Profile' : 'Create Account'} />
      </div>
    ),

    [STEP_PASSWORD]: (
      <div className="space-y-3">
        {pwInput('password', 'Password', 'Minimum 6 characters')}
        {pwInput('confirmPassword', 'Confirm Password', 'Re-enter your password')}
        <Btns onBack={back} loading={loading} success={success} submitLabel="Create Account" />
      </div>
    ),
  };

  const titles = {
    [STEP_METHOD]:   'Get started',
    [STEP_PERSONAL]: 'Personal Information',
    [STEP_ROLE]:     'Select Your Role',
    [STEP_PROFILE]:  'Profile Details',
    [STEP_ACADEMIC]: form.role === 'ROLE_FACULTY' ? 'Additional Details' : 'Academic Details',
    [STEP_PASSWORD]: 'Set Password',
  };

  const pageTitle = mode === 'complete' ? 'Complete your profile' : 'Create your account';

  return (
    <div className="fixed inset-0 flex">

      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex lg:w-[42%] xl:w-[38%] flex-col justify-between p-10"
        style={{ background: '#0f172a', borderRight: '1px solid rgba(255,255,255,0.05)' }}>

        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src="/campuxo_logo.png" alt="Campuxo" className="h-14 w-auto object-contain" />
          <span className="text-white font-bold text-lg tracking-tight">Campuxo</span>
        </div>

        {/* Centre copy */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-white leading-snug">
              Your campus,<br />all in one place.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Attendance, courses, grades and more — built for students and faculty alike.
            </p>
          </div>

          {/* Feature pills */}
          <div className="space-y-2.5">
            {[
              ['📋', 'Track attendance in real time'],
              ['📚', 'Manage courses & batches'],
              ['📊', 'View IA marks & results'],
            ].map(([icon, text]) => (
              <div key={text} className="flex items-center gap-3 rounded-xl px-4 py-2.5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <span className="text-base">{icon}</span>
                <span className="text-white/90 text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <p className="text-slate-600 text-xs">
          © {new Date().getFullYear()} Campuxo. All rights reserved.
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 bg-gray-50 overflow-y-auto flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          {/* Mobile logo (shown only on small screens) */}
          <div className="flex lg:hidden items-center gap-2 mb-6">
            <img src="/campuxo_logo.png" alt="Campuxo" className="h-12 w-auto object-contain" />
            <span className="font-bold text-gray-900">Campuxo</span>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col">

            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
              <h1 className="text-xl font-bold text-gray-900 leading-tight">{pageTitle}</h1>
              <p className="text-xs text-gray-400 mt-1">
                {mode === 'complete'
                  ? 'Fill in the remaining details to activate your account'
                  : step === STEP_METHOD
                  ? 'Choose how you want to register'
                  : `Step ${visibleCurrentIndex + 1} of ${visibleSteps.length}`}
              </p>

              {/* Progress stepper */}
              {mode && visibleSteps.length > 0 && (
                <div className="flex items-start mt-5">
                  {visibleStepLabels.map((label, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 relative">
                      {/* Connector line */}
                      {i < visibleStepLabels.length - 1 && (
                        <div className="absolute top-4 left-1/2 w-full h-0.5 overflow-hidden" style={{ left: '50%' }}>
                          <div className={`h-full transition-all duration-500 ${
                            i < visibleCurrentIndex ? 'bg-indigo-500 w-full' : 'bg-gray-200 w-full'
                          }`} />
                        </div>
                      )}
                      {/* Node */}
                      <div className="relative z-10">
                        {i < visibleCurrentIndex ? (
                          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shadow-sm shadow-indigo-200">
                            <FaCheckCircle className="w-3.5 h-3.5 text-white" />
                          </div>
                        ) : i === visibleCurrentIndex ? (
                          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center ring-4 ring-indigo-100 shadow-sm shadow-indigo-200">
                            <span className="text-[11px] font-bold text-white">{i + 1}</span>
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                            <span className="text-[11px] font-semibold text-gray-400">{i + 1}</span>
                          </div>
                        )}
                      </div>
                      {/* Label */}
                      <span className={`text-[10px] font-semibold tracking-wide uppercase ${
                        i === visibleCurrentIndex ? 'text-indigo-600' :
                        i < visibleCurrentIndex ? 'text-indigo-400' : 'text-gray-300'
                      }`}>{label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              {success ? (
                <div className="flex flex-col items-center text-center py-8 gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                      <FaCheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-bold text-gray-900">You're all set!</p>
                    <p className="text-sm text-gray-500">Registration submitted successfully.</p>
                    <p className="text-xs text-gray-400 mt-2">Awaiting admin approval — you'll be redirected shortly.</p>
                  </div>
                </div>
              ) : (
                <>
                  {step !== STEP_METHOD && (
                    <h2 className="text-sm font-semibold text-gray-800 mb-3">{titles[step]}</h2>
                  )}
                  {error && step !== STEP_METHOD && (
                    <div className="flex items-start gap-2.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-3 mb-3">
                      <FaExclamationCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}
                  <form onSubmit={handleSubmit}>{stepContent[step]}</form>
                </>
              )}
            </div>

            {/* Footer */}
            {mode !== 'complete' && !success && (
              <div className="px-6 py-3 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-500">
                  Already have an account?{' '}
                  <a href={ROUTES.LOGIN} className="text-indigo-600 hover:text-indigo-700 font-semibold">Sign in</a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
