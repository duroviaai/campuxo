import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import ROUTES from '../../../app/routes/routeConstants';

const inputCls = (err) =>
  `w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 bg-white ${
    err ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 focus:ring-indigo-300'
  }`;

const EyeIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const EyeOffIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>;

const Field = ({ name, label, type = 'text', autoComplete, form, fieldErrors, onChange, showPw, onTogglePw, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-gray-600">{label}<span className="text-red-500 ml-0.5">*</span></label>
    {children ?? (
      type === 'password' ? (
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            name={name}
            value={form[name]}
            onChange={onChange}
            required
            autoComplete={autoComplete}
            className={inputCls(fieldErrors[name]) + ' pr-10'}
          />
          <button type="button" onClick={onTogglePw}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPw ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      ) : (
        <input
          type={type}
          name={name}
          value={form[name]}
          onChange={onChange}
          required
          autoComplete={autoComplete}
          className={inputCls(fieldErrors[name])}
        />
      )
    )}
    {fieldErrors[name] && <p className="text-xs text-red-500">{fieldErrors[name]}</p>}
  </div>
);

const MultiStepRegisterPage = () => {
  const { registerUser } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    registrationNumber: '',
    facultyId: ''
  });
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showPasswords, setShowPasswords] = useState({ password: false, confirmPassword: false });
  const roles = [
    { value: 'ROLE_STUDENT', label: 'Student' },
    { value: 'ROLE_FACULTY', label: 'Faculty' }
  ];

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validateStep1 = () => {
    const errors = {};
    if (!form.fullName.trim()) errors.fullName = 'Full name is required';
    if (!form.email.trim()) errors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Invalid email format';
    return { isValid: Object.keys(errors).length === 0, errors };
  };

  const validateStep2 = () => {
    const errors = {};
    if (!form.role) errors.role = 'Please select a role';
    return { isValid: Object.keys(errors).length === 0, errors };
  };

  const validateStep3 = () => {
    const errors = {};
    if (form.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    
    // Role-specific validation
    if (form.role === 'ROLE_STUDENT' && !form.registrationNumber.trim()) {
      errors.registrationNumber = 'Registration number is required for students';
    }
    if (form.role === 'ROLE_FACULTY' && !form.facultyId.trim()) {
      errors.facultyId = 'Faculty ID is required for faculty members';
    }
    
    return { isValid: Object.keys(errors).length === 0, errors };
  };

  const handleNext = () => {
    setError(null);
    setFieldErrors({});
    
    let validation;
    if (currentStep === 1) validation = validateStep1();
    else if (currentStep === 2) validation = validateStep2();
    
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }
    
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    setError(null);
    setFieldErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    
    const validation = validateStep3();
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }
    
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      console.log('Sending registration payload:', payload); // Debug log
      await registerUser(payload);
      setSuccess('Registration successful. Await admin approval.');
      
      setTimeout(() => {
        navigate(ROUTES.LOGIN);
      }, 3000);
    } catch (error) {
      console.error('Registration error:', error); // Debug log
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        console.error('Error response:', errorData);
        
        // Handle different error response formats
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
        
        // Handle field validation errors
        if (errorData.fieldErrors) {
          setFieldErrors(errorData.fieldErrors);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const togglePw = (name) => setShowPasswords(v => ({ ...v, [name]: !v[name] }));

  const fieldProps = { form, fieldErrors, onChange: handleChange };

  const renderStep1 = () => (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-gray-800 mb-2">Personal Information</h2>
      <Field name="fullName" label="Full Name" {...fieldProps} />
      <Field name="email" label="Email Address" type="email" autoComplete="email" {...fieldProps} />
      <button type="button" onClick={handleNext}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg py-2.5 transition-colors shadow-sm">
        Next
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-gray-800 mb-2">Select Your Role</h2>
      <Field name="role" label="Role" {...fieldProps}>
        <select name="role" value={form.role} onChange={handleChange} required
          className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 bg-white text-gray-700 ${
            fieldErrors.role ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 focus:ring-indigo-300'
          }`}>
          <option value="">Select Role</option>
          {roles.map(role => <option key={role.value} value={role.value}>{role.label}</option>)}
        </select>
      </Field>
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={handleBack}
          className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-lg py-2.5 transition-colors">
          Back
        </button>
        <button type="button" onClick={handleNext}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg py-2.5 transition-colors shadow-sm">
          Next
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-gray-800 mb-2">Complete Registration</h2>
      <Field name="password" label="Password" type="password" autoComplete="new-password" showPw={showPasswords.password} onTogglePw={() => togglePw('password')} {...fieldProps} />
      <Field name="confirmPassword" label="Confirm Password" type="password" autoComplete="new-password" showPw={showPasswords.confirmPassword} onTogglePw={() => togglePw('confirmPassword')} {...fieldProps} />
      {form.role === 'ROLE_STUDENT' && (
        <Field name="registrationNumber" label="Student Registration Number" {...fieldProps} />
      )}
      {form.role === 'ROLE_FACULTY' && (
        <Field name="facultyId" label="Faculty ID" {...fieldProps} />
      )}
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={handleBack}
          className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-lg py-2.5 transition-colors">
          Back
        </button>
        <button type="submit" disabled={loading || !!success}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg py-2.5 transition-colors shadow-sm">
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="mb-7 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-sm text-gray-500 mt-1">Step {currentStep} of 3</p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-7">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex-1 flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step < currentStep ? 'bg-indigo-600 text-white' :
                step === currentStep ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' :
                'bg-gray-100 text-gray-400'
              }`}>
                {step < currentStep ? '✓' : step}
              </div>
              {step < 3 && <div className={`h-0.5 w-full ${step < currentStep ? 'bg-indigo-600' : 'bg-gray-100'}`} />}
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 mb-4 text-center">{error}</p>}
        {success && <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 mb-4 text-center">{success}</p>}

        <form onSubmit={handleSubmit}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </form>

        <p className="text-sm text-gray-500 text-center mt-5">
          Already have an account?{' '}
          <a href={ROUTES.LOGIN} className="text-indigo-600 hover:text-indigo-700 font-semibold">Sign in</a>
        </p>
      </div>
    </div>
  );
};

export default MultiStepRegisterPage;