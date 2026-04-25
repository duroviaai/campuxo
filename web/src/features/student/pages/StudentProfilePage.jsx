import { useEffect, useState, useRef } from 'react';
import { getMyProfile, updateMyProfile } from '../services/studentService';
import { DEPARTMENTS } from '../../faculty/utils/facultyHelpers';

const Field = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
    <span className="text-sm text-gray-800">{value || '—'}</span>
  </div>
);

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white';

const StudentProfilePage = () => {
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState(null);
  const [success, setSuccess]   = useState(false);
  const [form, setForm]         = useState({});
  const fileRef                 = useRef();

  useEffect(() => {
    getMyProfile()
      .then((data) => { setProfile(data); setForm(toForm(data)); })
      .catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false));
  }, []);

  const toForm = (p) => ({
    firstName:       p.firstName       || '',
    lastName:        p.lastName        || '',
    phone:           p.phone           || '',
    department:      p.department      || '',
    dateOfBirth:     p.dateOfBirth     || '',
    yearOfStudy:     p.yearOfStudy     || '',
    courseStartYear: p.courseStartYear || '',
    courseEndYear:   p.courseEndYear   || '',
    photoUrl:        p.photoUrl        || '',
  });

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // Simple base64 preview — in production replace with a real upload endpoint
  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, photoUrl: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const updated = await updateMyProfile({
        ...form,
        yearOfStudy:     form.yearOfStudy     ? Number(form.yearOfStudy)     : null,
        courseStartYear: form.courseStartYear ? Number(form.courseStartYear) : null,
        courseEndYear:   form.courseEndYear   ? Number(form.courseEndYear)   : null,
      });
      setProfile(updated);
      setForm(toForm(updated));
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-gray-500">Loading profile...</p>;

  const avatar = profile?.photoUrl || form?.photoUrl;
  const initials = (profile?.fullName || profile?.firstName || '?')[0]?.toUpperCase();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        {!editing && (
          <button
            onClick={() => { setEditing(true); setError(null); }}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm"
          >
            ✎ Edit Profile
          </button>
        )}
      </div>

      {success && (
        <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <span>✓</span> Profile updated successfully!
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <span>✕</span> {error}
        </div>
      )}

      {/* Banner + avatar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600" />
        <div className="px-6 pb-5">
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="relative">
              {avatar ? (
                <img src={avatar} alt="Profile" className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-indigo-100 border-4 border-white shadow-md flex items-center justify-center text-2xl font-bold text-indigo-600">
                  {initials}
                </div>
              )}
              {editing && (
                <>
                  <button
                    type="button"
                    onClick={() => fileRef.current.click()}
                    className="absolute bottom-0 right-0 w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs hover:bg-indigo-700 shadow-sm border-2 border-white"
                    title="Change photo"
                  >
                    ✎
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                </>
              )}
            </div>
            <div className="mb-1">
              <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-3 py-1 rounded-full">
                {profile?.department || 'Student'}
              </span>
            </div>
          </div>
          <p className="text-lg font-bold text-gray-900">{profile?.fullName}</p>
          <p className="text-sm text-gray-500">{profile?.email}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-indigo-600 font-mono bg-indigo-50 px-2 py-0.5 rounded">
              {profile?.registrationNumber || 'No Reg No'}
            </span>
            {profile?.yearOfStudy && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                Year {profile.yearOfStudy}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Details */}
      {!editing ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="First Name"    value={profile?.firstName} />
          <Field label="Last Name"     value={profile?.lastName} />
          <Field label="Phone"         value={profile?.phone} />
          <Field label="Department"    value={profile?.department} />
          <Field label="Date of Birth" value={profile?.dateOfBirth} />
          <Field label="Year of Study"     value={profile?.yearOfStudy ? `Year ${profile.yearOfStudy}` : null} />
          <Field label="Course Start Year" value={profile?.courseStartYear} />
          <Field label="Course End Year"   value={profile?.courseEndYear} />
          <Field label="Class Batch"       value={profile?.classBatchName} />
          <Field label="Scheme"             value={profile?.scheme} />
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: 'firstName', label: 'First Name', required: true },
              { name: 'lastName',  label: 'Last Name' },
              { name: 'phone',     label: 'Phone' },
            ].map(({ name, label, required }) => (
              <div key={name} className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500">
                  {label}{required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
                <input
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  required={required}
                  className={inputCls}
                />
              </div>
            ))}

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500">Department</label>
              <select name="department" value={form.department} onChange={handleChange} className={inputCls}>
                <option value="">Select department</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500">Date of Birth</label>
              <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} className={inputCls} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500">Year of Study</label>
              <select name="yearOfStudy" value={form.yearOfStudy} onChange={handleChange} className={inputCls}>
                <option value="">Select year</option>
                {[1, 2, 3, 4].map((y) => (
                  <option key={y} value={y}>Year {y}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500">Course Start Year</label>
              <select name="courseStartYear" value={form.courseStartYear} onChange={handleChange} className={inputCls}>
                <option value="">Select year</option>
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500">Course End Year</label>
              <select name="courseEndYear" value={form.courseEndYear} onChange={handleChange} className={inputCls}>
                <option value="">Select year</option>
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => { setEditing(false); setForm(toForm(profile)); setError(null); }}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-colors shadow-sm"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default StudentProfilePage;
