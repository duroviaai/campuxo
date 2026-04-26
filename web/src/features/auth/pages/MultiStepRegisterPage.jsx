import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  `w-full border rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
    err ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
  }`;

const inpNoIcon = (err) =>
  `w-full border rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
    err ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
  }`;

const IconInput = ({ icon: Icon, error, children }) => (
  <div className="relative">
    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 pointer-events-none" />
    {children}
    {error && <FaExclamationCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 w-3.5 h-3.5" />}
  </div>
);

const F = ({ label, error, required, children }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-gray-700">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
  </div>
);

const Btns = ({ onBack, onNext, loading, success, submitLabel }) => (
  <div className="flex gap-3 pt-2">
    {onBack && (
      <button type="button" onClick={onBack}
        className="flex items-center gap-2 flex-1 justify-center border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg py-2.5 hover:bg-gray-50 transition-colors">
        <FaArrowLeft className="w-3 h-3" /> Back
      </button>
    )}
    {onNext ? (
      <button type="button" onClick={onNext}
        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg py-2.5 transition-colors">
        Continue
      </button>
    ) : (
      <button type="submit" disabled={loading || !!success}
        className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg py-2.5 transition-colors">
        {loading ? 'Submitting…' : submitLabel || 'Submit'}
      </button>
    )}
  </div>
);

const ALL_STEPS = ['Method', 'Personal', 'Role', 'Profile', 'Academic', 'Password'];

export default function MultiStepRegisterPage() {
  const { registerUser, googlePrefill, googleRegisterUser } = useAuth();
  const navigate = useNavigate();

  const [method, setMethod] = useState(null);
  const [googleAccessToken, setGoogleAccessToken] = useState(null);
  const [step, setStep] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: '', email: '', role: '',
    registrationNumber: '', phone: '', dateOfBirth: '',
    department: '', yearOfStudy: '', courseStartYear: '', courseEndYear: '',
    facultyId: '', designation: '', qualification: '', experience: '', joiningDate: '',
    password: '', confirmPassword: '',
  });
  const [fe, setFe] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState({ password: false, confirmPassword: false });

  useEffect(() => {
    httpClient.get('/api/v1/departments').then((r) => setDepartments(r.data)).catch(() => {});
  }, []);

  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const togglePw = (k) => setShowPw((v) => ({ ...v, [k]: !v[k] }));
  const yearOpts = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 3 + i);

  const activeSteps = method === 'google' ? [0, 2, 3, 4] : [0, 1, 2, 3, 4, 5];
  const currentIndex = activeSteps.indexOf(step);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setError(null);
      try {
        const res = await googlePrefill(tokenResponse.access_token);
        if (res.username) setForm((f) => ({ ...f, fullName: res.username }));
        if (res.email)    setForm((f) => ({ ...f, email: res.email }));
        setGoogleAccessToken(tokenResponse.access_token);
        setMethod('google');
        setStep(2);
      } catch (err) {
        setError(err?.response?.data?.message || 'Google sign-in failed.');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => setError('Google sign-in failed.'),
  });

  const validators = {
    1: () => {
      const e = {};
      if (!form.fullName.trim()) e.fullName = 'Full name is required';
      if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email is required';
      return e;
    },
    2: () => (!form.role ? { role: 'Please select a role' } : {}),
    3: () => {
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
    4: () => {
      const e = {};
      if (form.role === 'ROLE_STUDENT') {
        if (!form.dateOfBirth) e.dateOfBirth = 'Date of birth is required';
        if (!form.yearOfStudy) e.yearOfStudy = 'Year of study is required';
        if (!form.courseStartYear) e.courseStartYear = 'Required';
        if (!form.courseEndYear) e.courseEndYear = 'Required';
      }
      return e;
    },
    5: () => {
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
    if (prevStep !== undefined) setStep(prevStep);
    if (prevStep === 0) setMethod(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Always validate the current step before submitting
    const errors = validators[step] ? validators[step]() : {};
    if (Object.keys(errors).length) { setFe(errors); return; }
    if (method === 'email') {
      const pwErrors = validators[5]();
      if (Object.keys(pwErrors).length) { setFe(pwErrors); return; }
    }
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      Object.keys(payload).forEach((k) => { if (payload[k] === '') payload[k] = null; });
      if (method === 'google') {
        await googleRegisterUser(googleAccessToken, payload);
      } else {
        await registerUser(payload);
      }
      setSuccess('Registration submitted! Awaiting admin approval.');
      setTimeout(() => navigate(ROUTES.LOGIN), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.');
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

  const visibleSteps = activeSteps.filter((s) => s !== 0);
  const visibleStepLabels = visibleSteps.map((s) => ALL_STEPS[s]);
  const visibleCurrentIndex = visibleSteps.indexOf(step);

  const stepContent = {
    // 0 — Method
    0: (
      <div className="space-y-3">
        <button type="button" onClick={() => googleLogin()} disabled={googleLoading}
          className="w-full flex items-center justify-center gap-2.5 border border-gray-300 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-60">
          <FaGoogle className="w-4 h-4 text-red-500" />
          {googleLoading ? 'Connecting…' : 'Continue with Google'}
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <button type="button" onClick={() => { setMethod('email'); setStep(1); }}
          className="w-full flex items-center justify-center gap-2.5 border border-gray-300 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all">
          <FaEnvelope className="w-4 h-4 text-gray-500" />
          Continue with Email
        </button>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <FaExclamationCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}
      </div>
    ),

    // 1 — Personal
    1: (
      <div className="space-y-3">
        <F label="Full Name" error={fe.fullName} required>
          <IconInput icon={FaUser} error={fe.fullName}>
            <input name="fullName" value={form.fullName} onChange={set} placeholder="Your full name" className={inp(fe.fullName)} />
          </IconInput>
        </F>
        <F label="Email Address" error={fe.email} required>
          <IconInput icon={FaEnvelope} error={fe.email}>
            <input name="email" type="email" value={form.email} onChange={set} placeholder="name@institution.edu" className={inp(fe.email)} />
          </IconInput>
        </F>
        <Btns onBack={back} onNext={next} />
      </div>
    ),

    // 2 — Role
    2: (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {[
            ['ROLE_STUDENT', FaGraduationCap, 'Student', 'Enroll as a student'],
            ['ROLE_FACULTY', FaChalkboardTeacher, 'Faculty', 'Join as faculty'],
          ].map(([val, Icon, label, sub]) => (
            <button key={val} type="button" onClick={() => setForm((f) => ({ ...f, role: val }))}
              className={`py-5 px-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                form.role === val
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 text-gray-500 hover:border-indigo-300 hover:bg-gray-50'
              }`}>
              <Icon className="w-6 h-6" />
              <span className="text-sm font-semibold">{label}</span>
              <span className="text-xs text-gray-400">{sub}</span>
            </button>
          ))}
        </div>
        {fe.role && <p className="text-xs text-red-500">{fe.role}</p>}
        <Btns onBack={back} onNext={next} />
      </div>
    ),

    // 3 — Profile
    3: (
      <div className="space-y-3">
        {form.role === 'ROLE_STUDENT' && (<>
          <F label="Registration Number" error={fe.registrationNumber} required>
            <IconInput icon={FaIdCard} error={fe.registrationNumber}>
              <input name="registrationNumber" value={form.registrationNumber} onChange={set} placeholder="e.g. 1RV21CS001" className={inp(fe.registrationNumber)} />
            </IconInput>
          </F>
          <F label="Phone Number" error={fe.phone} required>
            <IconInput icon={FaPhone} error={fe.phone}>
              <input name="phone" value={form.phone} onChange={set} placeholder="9876543210" className={inp(fe.phone)} />
            </IconInput>
          </F>
          <F label="Department" error={fe.department} required>
            {deptSelect('department', form.department, fe.department)}
          </F>
        </>)}
        {form.role === 'ROLE_FACULTY' && (<>
          <F label="Faculty ID" error={fe.facultyId} required>
            <IconInput icon={FaIdCard} error={fe.facultyId}>
              <input name="facultyId" value={form.facultyId} onChange={set} placeholder="e.g. FAC2024001" className={inp(fe.facultyId)} />
            </IconInput>
          </F>
          <F label="Phone Number" error={fe.phone} required>
            <IconInput icon={FaPhone} error={fe.phone}>
              <input name="phone" value={form.phone} onChange={set} placeholder="9876543210" className={inp(fe.phone)} />
            </IconInput>
          </F>
          <F label="Department" error={fe.department} required>
            {deptSelect('department', form.department, fe.department)}
          </F>
          <F label="Designation" error={fe.designation} required>
            <IconInput icon={FaBriefcase} error={fe.designation}>
              <input name="designation" value={form.designation} onChange={set} placeholder="e.g. Assistant Professor" className={inp(fe.designation)} />
            </IconInput>
          </F>
        </>)}
        <Btns onBack={back} onNext={next} />
      </div>
    ),

    // 4 — Academic
    4: (
      <div className="space-y-3">
        {form.role === 'ROLE_STUDENT' && (<>
          <F label="Date of Birth" error={fe.dateOfBirth} required>
            <IconInput icon={FaCalendarAlt} error={fe.dateOfBirth}>
              <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={set}
                max={new Date().toISOString().split('T')[0]} className={inp(fe.dateOfBirth)} />
            </IconInput>
          </F>
          <F label="Year of Study" error={fe.yearOfStudy} required>
            <IconInput icon={FaUniversity} error={fe.yearOfStudy}>
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
          <div className="grid grid-cols-2 gap-2">
            <F label="Qualification" error={fe.qualification}>
              <input name="qualification" value={form.qualification} onChange={set} placeholder="e.g. M.Tech" className={inpNoIcon(fe.qualification)} />
            </F>
            <F label="Experience (yrs)" error={fe.experience}>
              <input type="number" min="0" name="experience" value={form.experience} onChange={set} placeholder="e.g. 5" className={inpNoIcon(fe.experience)} />
            </F>
          </div>
          <F label="Joining Date" error={fe.joiningDate}>
            <IconInput icon={FaCalendarAlt} error={fe.joiningDate}>
              <input type="date" name="joiningDate" value={form.joiningDate} onChange={set}
                max={new Date().toISOString().split('T')[0]} className={inp(fe.joiningDate)} />
            </IconInput>
          </F>
        </>)}
        <Btns onBack={back} onNext={method === 'google' ? undefined : next} loading={loading} success={success} submitLabel="Create Account" />
      </div>
    ),

    // 5 — Password
    5: (
      <div className="space-y-3">
        {pwInput('password', 'Password', 'Minimum 6 characters')}
        {pwInput('confirmPassword', 'Confirm Password', 'Re-enter your password')}
        <Btns onBack={back} loading={loading} success={success} submitLabel="Create Account" />
      </div>
    ),
  };

  const titles = {
    0: 'Get started',
    1: 'Personal Information',
    2: 'Select Your Role',
    3: 'Profile Details',
    4: form.role === 'ROLE_FACULTY' ? 'Additional Details' : 'Academic Details',
    5: 'Set Password',
  };

  return (
    <div className="fixed inset-0 bg-gray-50 flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-md mx-4 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col" style={{ maxHeight: '96vh' }}>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
          <div className="text-center mb-5">
            <h1 className="text-xl font-semibold text-gray-900">Create your account</h1>
            {method && <p className="text-xs text-gray-400 mt-1">Step {visibleCurrentIndex + 1} of {visibleSteps.length}</p>}
          </div>

          {method && visibleSteps.length > 0 && (
            <div className="flex items-start">
              {visibleStepLabels.map((label, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5 relative">
                  {i < visibleStepLabels.length - 1 && (
                    <div className={`absolute top-3.5 left-1/2 w-full h-0.5 ${i < visibleCurrentIndex ? 'bg-indigo-500' : 'bg-gray-100'}`} />
                  )}
                  <div className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                    i < visibleCurrentIndex ? 'bg-indigo-600 text-white' :
                    i === visibleCurrentIndex ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {i < visibleCurrentIndex
                      ? <FaCheckCircle className="w-3.5 h-3.5" />
                      : i + 1}
                  </div>
                  <span className={`text-[9px] font-medium ${i === visibleCurrentIndex ? 'text-indigo-600' : 'text-gray-400'}`}>{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-4 flex-1 min-h-0 overflow-y-auto">
          <p className="text-sm font-medium text-gray-700 mb-4">{titles[step]}</p>

          {error && step !== 0 && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
              <FaExclamationCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-4">
              <FaCheckCircle className="w-4 h-4 shrink-0" />{success}
            </div>
          )}

          <form onSubmit={handleSubmit}>{stepContent[step]}</form>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 shrink-0 text-center">
          <p className="text-xs text-gray-500">
            Already have an account?{' '}
            <a href={ROUTES.LOGIN} className="text-indigo-600 hover:text-indigo-700 font-semibold">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}
