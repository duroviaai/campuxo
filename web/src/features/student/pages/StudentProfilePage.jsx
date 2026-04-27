import { useEffect, useState, useRef } from 'react';
import { getMyProfile, updateMyProfile } from '../services/studentService';
import { DEPARTMENTS } from '../../faculty/utils/facultyHelpers';

const Field = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{label}</span>
    <span className="text-sm font-medium text-slate-800">{value || '—'}</span>
  </div>
);

const inputCls = 'w-full px-3.5 py-2.5 text-sm rounded-lg outline-none transition-all';
const inputStyle = { border: '1.5px solid #e2e8f0', background: '#fff', color: '#0f172a' };

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

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="rounded-2xl h-24 skeleton" />)}</div>;

  const avatar = profile?.photoUrl || form?.photoUrl;
  const initials = (profile?.fullName || profile?.firstName || '?')[0]?.toUpperCase();

  return (
    <div className="max-w-2xl space-y-6 animate-fade-up">
      {!editing && (
        <div className="flex justify-end">
      <button onClick={() => { setEditing(true); setError(null); }}
          className="px-4 py-2 text-xs font-semibold rounded-lg text-white"
          style={{ background: '#7c3aed' }}>
          Edit Profile
        </button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 text-sm text-emerald-700 rounded-xl px-4 py-3" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <span>✓</span> Profile updated successfully!
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-700 rounded-xl px-4 py-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <span>✕</span> {error}
        </div>
      )}

      <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #e8edf2' }}>
        <div className="h-20" style={{ background: '#0f172a' }} />
        <div className="px-6 pb-5">
          <div className="flex items-end justify-between -mt-8 mb-4">
            <div className="relative">
              {avatar ? (
                <img src={avatar} alt="Profile" className="w-16 h-16 rounded-xl object-cover border-4 border-white" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }} />
              ) : (
                <div className="w-16 h-16 rounded-xl border-4 border-white flex items-center justify-center text-xl font-bold text-white" style={{ background: '#7c3aed', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                  {initials}
                </div>
              )}
              {editing && (
                <>
                  <button type="button" onClick={() => fileRef.current.click()}
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs border-2 border-white"
                    style={{ background: '#7c3aed' }} title="Change photo">
                    ✎
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                </>
              )}
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md mb-1" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
              {profile?.department || 'Student'}
            </span>
          </div>
          <p className="text-base font-bold" style={{ color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{profile?.fullName}</p>
          <p className="text-sm" style={{ color: '#64748b' }}>{profile?.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md" style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }}>
              {profile?.registrationNumber || 'No Reg No'}
            </span>
            {profile?.yearOfStudy && (
              <span className="text-[11px] px-2 py-0.5 rounded-md" style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }}>
                Year {profile.yearOfStudy}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Details */}
      {!editing ? (
        <div className="bg-white rounded-xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-5" style={{ border: '1px solid #e8edf2' }}>
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
        <form onSubmit={handleSave} className="bg-white rounded-xl p-6 space-y-4" style={{ border: '1px solid #e8edf2' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: 'firstName', label: 'First Name', required: true },
              { name: 'lastName',  label: 'Last Name' },
              { name: 'phone',     label: 'Phone' },
            ].map(({ name, label, required }) => (
              <div key={name} className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold" style={{ color: '#64748b' }}>
                  {label}{required && <span className="ml-0.5" style={{ color: '#dc2626' }}>*</span>}
                </label>
                <input name={name} value={form[name]} onChange={handleChange} required={required}
                  className={inputCls} style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#7c3aed'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = ''; }}
                />
              </div>
            ))}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold" style={{ color: '#64748b' }}>Department</label>
              <select name="department" value={form.department} onChange={handleChange} className={inputCls} style={inputStyle}>
                <option value="">Select department</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold" style={{ color: '#64748b' }}>Date of Birth</label>
              <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} className={inputCls} style={inputStyle} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold" style={{ color: '#64748b' }}>Year of Study</label>
              <select name="yearOfStudy" value={form.yearOfStudy} onChange={handleChange} className={inputCls} style={inputStyle}>
                <option value="">Select year</option>
                {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold" style={{ color: '#64748b' }}>Course Start Year</label>
              <select name="courseStartYear" value={form.courseStartYear} onChange={handleChange} className={inputCls} style={inputStyle}>
                <option value="">Select year</option>
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold" style={{ color: '#64748b' }}>Course End Year</label>
              <select name="courseEndYear" value={form.courseEndYear} onChange={handleChange} className={inputCls} style={inputStyle}>
                <option value="">Select year</option>
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => { setEditing(false); setForm(toForm(profile)); setError(null); }}
              className="px-4 py-2 text-xs font-semibold rounded-lg transition-colors"
              style={{ background: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0' }}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 text-xs font-bold rounded-lg text-white disabled:opacity-50 transition-opacity"
              style={{ background: '#7c3aed' }}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default StudentProfilePage;
