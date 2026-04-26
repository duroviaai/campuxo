import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import {
  FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash,
  FaPhone, FaIdCard, FaBuilding, FaChalkboardTeacher,
  FaGraduationCap, FaCalendarAlt, FaBriefcase, FaUniversity,
  FaGoogle, FaArrowLeft, FaCheckCircle, FaExclamationCircle,
} from 'react-icons/fa';
import useAuth from '../hooks/useAuth';
import ROUTES from '../../../app/routes/routeConstants';
import httpClient from '../../../services/httpClient';

const inp = (err) =>
  `w-full border rounded-lg pl-9 pr-3.5 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
    err ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
  }`;

const inpNoIcon = (err) =>
  `w-full border rounded-lg px-3.5 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
    err ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
  }`;

const IconInput = ({ icon: Icon, children }) => (
  <div className="relative">
    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 pointer-events-none" />
    {children}
  </div>
);

const F = ({ label, error, required, children }) => (
  <div className="space-y-1">
    <label className="block text-xs font-medium text-gray-700">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-[11px] text-red-500 mt-0.5">{error}</p>}
  </div>
);

const Btns = ({ onBack, onNext, loading, success, submitLabel }) => (
  <div className="flex gap-3 pt-1">
    {onBack && (
      <button type="button" onClick={onBack} disabled={loading}
        className="flex items-center gap-2 flex-1 justify-center border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg py-2 hover:bg-gray-50 disabled:opacity-50 transition-colors">
        <FaArrowLeft className="w-3 h-3" /> Back
      </button>
    )}
    {onNext ? (
      <button type="button" onClick={onNext}
        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg py-2 transition-colors">
        Continue
      </button>
    ) : (
      <button type="submit" disabled={loading || !!success}
        className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg py-2 transition-colors">
        {loading ? 'Submitting…' : submitLabel || 'Submit'}
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
  const [googleLoading, setGoogleLoading] = useState(false);

  const [form, setForm] = useState(() => ({
    fullName: locationState?.prefill?.fullName ?? authUser?.username ?? '',
    email:    locationState?.prefill?.email    ?? authUser?.email    ?? '',
    role: '',
    registrationNumber: '', phone: '', dateOfBirth: '',
    department: '', yearOfStudy: '', courseStartYear: '', courseEndYear: '',
    facultyId: '', designation: '', qualification: '', experience: '', joiningDate: '',
    password: '', confirmPassword: '',
  }));
  const [fe, setFe] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState({ password: false, confirmPassword: false });

  useEffect(() => {
    httpClient.get('/api/v1/departments').then((r) => setDepartments(r.data)).catch(() => {});
    // Clear navigation state so a page refresh doesn't re-trigger the Google flow with a stale token
    if (locationState?.googleAccessToken) {
      window.history.replaceState({}, '');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    [STEP_ROLE]: () => (!form.role ? { role: 'Please select a role' } : {}),
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
        if (!form.courseStartYear) e.courseStartYear = 'Required';
        if (!form.courseEndYear) e.courseEndYear = 'Required';
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
      <FaBuilding className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 pointer-events-none" />
      <select name={name} value={val} onChange={set} className={inp(err) + ' appearance-none'}>
        <option value="">Select department</option>
        {departments.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
      </select>
    </div>
  );

  const pwInput = (name, label, placeholder) => (
    <F label={label} error={fe[name]} required>
      <div className="relative">
        <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 pointer-events-none" />
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
      <div className="space-y-2.5 pt-1">
        <button type="button" onClick={() => googleLogin()} disabled={googleLoading}
          className="w-full flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all disabled:opacity-60">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-gray-200 shrink-0">
            <FaGoogle className="w-4 h-4 text-red-500" />
          </span>
          <span className="flex-1 text-left">
            <span className="block font-semibold text-gray-800">{googleLoading ? 'Connecting…' : 'Continue with Google'}</span>
            <span className="block text-xs text-gray-400 font-normal">Use your Google account</span>
          </span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-400 font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <button type="button" onClick={() => { setMode('email'); setStep(STEP_PERSONAL); }}
          className="w-full flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-gray-200 shrink-0">
            <FaEnvelope className="w-4 h-4 text-indigo-500" />
          </span>
          <span className="flex-1 text-left">
            <span className="block font-semibold text-gray-800">Continue with Email</span>
            <span className="block text-xs text-gray-400 font-normal">Register with email & password</span>
          </span>
        </button>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <FaExclamationCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}
      </div>
    ),

    [STEP_PERSONAL]: (
      <div className="space-y-2.5">
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
      <div className="space-y-2.5">
        <div className="grid grid-cols-2 gap-3">
          {[
            ['ROLE_STUDENT', FaGraduationCap, 'Student', 'Enroll as a student'],
            ['ROLE_FACULTY', FaChalkboardTeacher, 'Faculty', 'Join as faculty'],
          ].map(([val, Icon, label, sub]) => (
            <button key={val} type="button" onClick={() => setForm((f) => ({ ...f, role: val }))}
              className={`py-3.5 px-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all ${
                form.role === val
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 text-gray-500 hover:border-indigo-300 hover:bg-gray-50'
              }`}>
              <Icon className="w-5 h-5" />
              <span className="text-sm font-semibold">{label}</span>
              <span className="text-xs text-gray-400">{sub}</span>
            </button>
          ))}
        </div>
        {fe.role && <p className="text-xs text-red-500">{fe.role}</p>}
        <Btns onBack={mode !== 'complete' ? back : undefined} onNext={next} />
      </div>
    ),

    [STEP_PROFILE]: (
      <div className="space-y-2.5">
        {form.role === 'ROLE_STUDENT' && (<>
          <F label="Registration Number" error={fe.registrationNumber} required>
            <IconInput icon={FaIdCard}>
              <input name="registrationNumber" value={form.registrationNumber} onChange={set} placeholder="e.g. 1RV21CS001" className={inp(fe.registrationNumber)} />
            </IconInput>
          </F>
          <F label="Phone Number" error={fe.phone} required>
            <IconInput icon={FaPhone}>
              <input name="phone" value={form.phone} onChange={set} placeholder="9876543210" className={inp(fe.phone)} />
            </IconInput>
          </F>
          <F label="Department" error={fe.department} required>
            {deptSelect('department', form.department, fe.department)}
          </F>
        </>)}
        {form.role === 'ROLE_FACULTY' && (<>
          <F label="Faculty ID" error={fe.facultyId} required>
            <IconInput icon={FaIdCard}>
              <input name="facultyId" value={form.facultyId} onChange={set} placeholder="e.g. FAC2024001" className={inp(fe.facultyId)} />
            </IconInput>
          </F>
          <F label="Phone Number" error={fe.phone} required>
            <IconInput icon={FaPhone}>
              <input name="phone" value={form.phone} onChange={set} placeholder="9876543210" className={inp(fe.phone)} />
            </IconInput>
          </F>
          <F label="Department" error={fe.department} required>
            {deptSelect('department', form.department, fe.department)}
          </F>
          <F label="Designation" error={fe.designation} required>
            <IconInput icon={FaBriefcase}>
              <input name="designation" value={form.designation} onChange={set} placeholder="e.g. Assistant Professor" className={inp(fe.designation)} />
            </IconInput>
          </F>
        </>)}
        <Btns onBack={back} onNext={next} />
      </div>
    ),

    [STEP_ACADEMIC]: (
      <div className="space-y-2.5">
        {form.role === 'ROLE_STUDENT' && (<>
          <F label="Date of Birth" error={fe.dateOfBirth} required>
            <IconInput icon={FaCalendarAlt}>
              <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={set}
                max={new Date().toISOString().split('T')[0]} className={inp(fe.dateOfBirth)} />
            </IconInput>
          </F>
          <F label="Year of Study" error={fe.yearOfStudy} required>
            <IconInput icon={FaUniversity}>
              <select name="yearOfStudy" value={form.yearOfStudy} onChange={set} className={inp(fe.yearOfStudy) + ' appearance-none'}>
                <option value="">Select current year</option>
                {[1, 2, 3].map((y) => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </IconInput>
          </F>
          <div className="grid grid-cols-2 gap-2">
            <F label="Start Year" error={fe.courseStartYear} required>
              <select name="courseStartYear" value={form.courseStartYear} onChange={set} className={inpNoIcon(fe.courseStartYear)}>
                <option value="">Year</option>
                {yearOpts.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </F>
            <F label="End Year" error={fe.courseEndYear} required>
              <select name="courseEndYear" value={form.courseEndYear} onChange={set} className={inpNoIcon(fe.courseEndYear)}>
                <option value="">Year</option>
                {yearOpts.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </F>
          </div>
        </>)}
        {form.role === 'ROLE_FACULTY' && (<>
          <F label="Qualification" error={fe.qualification} required>
            <IconInput icon={FaGraduationCap}>
              <input name="qualification" value={form.qualification} onChange={set} placeholder="e.g. M.Tech" className={inp(fe.qualification)} />
            </IconInput>
          </F>
          <div className="grid grid-cols-2 gap-3">
            <F label="Experience (yrs)" error={fe.experience}>
              <input type="number" min="0" name="experience" value={form.experience} onChange={set} placeholder="e.g. 5" className={inpNoIcon(fe.experience)} />
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
      <div className="space-y-2.5">
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
  const pageSubtitle = mode === 'complete'
    ? 'Fill in the remaining details to activate your account'
    : step === STEP_METHOD
    ? 'Choose how you want to register'
    : `Step ${visibleCurrentIndex + 1} of ${visibleSteps.length}`;

  return (
    <div className="fixed inset-0 bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col">

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600 shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-semibold text-gray-900 leading-tight">{pageTitle}</h1>
              <p className="text-xs text-gray-400 mt-0.5">{pageSubtitle}</p>
            </div>
          </div>

          {/* Progress stepper */}
          {mode && visibleSteps.length > 0 && (
            <div className="flex items-start">
              {visibleStepLabels.map((label, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 relative">
                  {i < visibleStepLabels.length - 1 && (
                    <div className={`absolute top-3 left-1/2 right-0 translate-x-3 h-0.5 transition-colors ${i < visibleCurrentIndex ? 'bg-indigo-500' : 'bg-gray-200'}`} />
                  )}
                  <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    i < visibleCurrentIndex ? 'bg-indigo-600 text-white' :
                    i === visibleCurrentIndex ? 'bg-indigo-600 text-white ring-2 ring-indigo-100' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {i < visibleCurrentIndex ? <FaCheckCircle className="w-3 h-3" /> : i + 1}
                  </div>
                  <span className={`text-[9px] font-medium ${i === visibleCurrentIndex ? 'text-indigo-600' : 'text-gray-400'}`}>{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {success ? (
            <div className="flex flex-col items-center text-center py-4 gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <FaCheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Registration submitted!</p>
                <p className="text-xs text-gray-500 mt-1">Your account is awaiting admin approval.<br />You'll be redirected to login shortly.</p>
              </div>
            </div>
          ) : (
            <>
              {step !== STEP_METHOD && (
                <h2 className="text-sm font-semibold text-gray-800 mb-3">{titles[step]}</h2>
              )}
              {error && step !== STEP_METHOD && (
                <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 mb-3">
                  <FaExclamationCircle className="w-3.5 h-3.5 shrink-0" />{error}
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
  );
}
