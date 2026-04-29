import { useEffect, useState, useRef } from 'react';
import { getMyProfile, updateMyProfile } from '../services/studentService';
import httpClient from '../../../services/httpClient';
import { useGetMyStatsQuery, useUploadMyPhotoMutation } from '../state/studentApi';
import { Badge } from '../../../shared/components/ui/PageShell';

const Field = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{label}</span>
    <span className="text-sm font-medium text-slate-800">{value || '—'}</span>
  </div>
);

const ReadOnlyField = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#94a3b8' }}>{label}</span>
    <span className="text-sm font-medium px-2 py-1 rounded-md" style={{ color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
      {value || '—'}
    </span>
  </div>
);

const inputCls = 'w-full px-3.5 py-2.5 text-sm rounded-lg outline-none transition-all';
const inputStyle = { border: '1.5px solid #e2e8f0', background: '#fff', color: '#0f172a' };
const focusHandlers = {
  onFocus: e => { e.target.style.borderColor = '#7c3aed'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'; },
  onBlur:  e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = ''; },
};

const isProfileComplete = (p) =>
  p && p.phone && p.department && p.dateOfBirth && p.yearOfStudy && p.courseStartYear && p.courseEndYear;

const StudentProfilePage = () => {
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState(null);
  const [success, setSuccess]   = useState(false);
  const [form, setForm]         = useState({});
  const [specializations, setSpecializations] = useState([]);
  const [photoUploading, setPhotoUploading]   = useState(false);
  const fileRef = useRef();

  const { data: stats } = useGetMyStatsQuery();
  const [uploadMyPhoto] = useUploadMyPhotoMutation();

  useEffect(() => {
    getMyProfile()
      .then((data) => { setProfile(data); setForm(toForm(data)); })
      .catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false));
  }, []);

  const toForm = (p) => ({
    firstName:        p.firstName        || '',
    lastName:         p.lastName         || '',
    phone:            p.phone            || '',
    dateOfBirth:      p.dateOfBirth      || '',
    specializationId: p.specializationId || '',
  });

  useEffect(() => {
    if (!profile?.department || !profile?.scheme) { setSpecializations([]); return; }
    httpClient.get('/api/v1/specializations', {
      params: { department: profile.department, scheme: profile.scheme },
    }).then((r) => setSpecializations(r.data)).catch(() => setSpecializations([]));
  }, [profile?.department, profile?.scheme]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('photo', file);
      const updated = await uploadMyPhoto(fd).unwrap();
      setProfile(updated);
    } catch (err) {
      setError(err?.data?.message || 'Failed to upload photo.');
    } finally {
      setPhotoUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError(null); setSuccess(false);
    try {
      const updated = await updateMyProfile({
        firstName:        form.firstName,
        lastName:         form.lastName,
        phone:            form.phone,
        dateOfBirth:      form.dateOfBirth || null,
        specializationId: form.specializationId ? Number(form.specializationId) : null,
        // pass through read-only fields unchanged
        department:      profile.department,
        yearOfStudy:     profile.yearOfStudy,
        courseStartYear: profile.courseStartYear,
        courseEndYear:   profile.courseEndYear,
        scheme:          profile.scheme,
        classBatchId:    profile.classBatchId,
        photoUrl:        profile.photoUrl,
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

  const avatar   = profile?.photoUrl;
  const initials = (profile?.fullName || profile?.firstName || '?')[0]?.toUpperCase();
  const complete = isProfileComplete(profile);

  return (
    <div className="max-w-2xl space-y-5 animate-fade-up">
      {/* Action bar */}
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
        <div className="flex items-center gap-2 text-sm text-emerald-700 rounded-xl px-4 py-3"
          style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <span>✓</span> Profile updated successfully!
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-700 rounded-xl px-4 py-3"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <span>✕</span> {error}
        </div>
      )}

      {/* Profile header card */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #e8edf2' }}>
        <div className="h-20" style={{ background: '#0f172a' }} />
        <div className="px-6 pb-5">
          <div className="flex items-end justify-between -mt-8 mb-4">
            {/* Avatar */}
            <div className="relative">
              {avatar ? (
                <img src={avatar} alt="Profile"
                  className="w-16 h-16 rounded-xl object-cover border-4 border-white"
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }} />
              ) : (
                <div className="w-16 h-16 rounded-xl border-4 border-white flex items-center justify-center text-xl font-bold text-white"
                  style={{ background: '#7c3aed', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                  {initials}
                </div>
              )}
              {/* Upload button always visible */}
              <button type="button"
                onClick={() => fileRef.current.click()}
                disabled={photoUploading}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs border-2 border-white disabled:opacity-60"
                style={{ background: '#7c3aed' }}
                title="Change photo">
                {photoUploading ? '…' : '✎'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </div>

            {/* Completeness badge */}
            <div className="mb-1">
              <Badge color={complete ? 'green' : 'amber'}>
                {complete ? '✓ Profile Complete' : '⚠ Incomplete'}
              </Badge>
            </div>
          </div>

          <p className="text-base font-bold" style={{ color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {profile?.fullName}
          </p>
          <p className="text-sm" style={{ color: '#64748b' }}>{profile?.email}</p>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            {profile?.registrationNumber && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md"
                style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }}>
                {profile.registrationNumber}
              </span>
            )}
            {profile?.department && (
              <span className="text-[11px] px-2 py-0.5 rounded-md"
                style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                {profile.department}
              </span>
            )}
            {profile?.yearOfStudy && (
              <span className="text-[11px] px-2 py-0.5 rounded-md"
                style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }}>
                Year {profile.yearOfStudy}
              </span>
            )}
          </div>
        </div>

        {/* Stats mini-bar */}
        {stats && (
          <div className="grid grid-cols-3 divide-x" style={{ borderTop: '1px solid #f1f5f9', borderColor: '#f1f5f9' }}>
            {[
              { label: 'Enrolled Courses', value: stats.totalEnrolledCourses ?? '—' },
              { label: 'Attendance',        value: stats.overallAttendancePercentage != null ? `${stats.overallAttendancePercentage}%` : '—' },
              { label: 'Year of Study',     value: stats.yearOfStudy ? `Year ${stats.yearOfStudy}` : '—' },
            ].map(({ label, value }) => (
              <div key={label} className="py-3 text-center">
                <p className="text-sm font-bold" style={{ color: '#0f172a' }}>{value}</p>
                <p className="text-[10px] font-medium mt-0.5" style={{ color: '#94a3b8' }}>{label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details / Edit form */}
      {!editing ? (
        <div className="bg-white rounded-xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-5" style={{ border: '1px solid #e8edf2' }}>
          <Field label="First Name"         value={profile?.firstName} />
          <Field label="Last Name"          value={profile?.lastName} />
          <Field label="Phone"              value={profile?.phone} />
          <Field label="Date of Birth"      value={profile?.dateOfBirth} />
          <Field label="Registration No."   value={profile?.registrationNumber} />
          <Field label="Department"         value={profile?.department} />
          <Field label="Year of Study"      value={profile?.yearOfStudy ? `Year ${profile.yearOfStudy}` : null} />
          <Field label="Scheme"             value={profile?.scheme} />
          <Field label="Course Start Year"  value={profile?.courseStartYear} />
          <Field label="Course End Year"    value={profile?.courseEndYear} />
          <Field label="Class Batch"        value={profile?.classBatchDisplayName || profile?.classBatchName} />
          <Field label="Semester"            value={profile?.semester != null ? `Semester ${profile.semester}` : null} />
          <Field label="Specialization"     value={profile?.specializationName} />
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-white rounded-xl p-6 space-y-5" style={{ border: '1px solid #e8edf2' }}>
          {/* Editable fields */}
          <div>
            <p className="text-xs font-semibold mb-3" style={{ color: '#64748b' }}>Personal Information</p>
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
                    className={inputCls} style={inputStyle} {...focusHandlers} />
                </div>
              ))}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold" style={{ color: '#64748b' }}>Date of Birth</label>
                <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange}
                  className={inputCls} style={inputStyle} {...focusHandlers} />
              </div>
            </div>
          </div>

          {/* Specialization (only editable academic field) */}
          {specializations.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold" style={{ color: '#64748b' }}>Specialization</label>
              <select name="specializationId" value={form.specializationId} onChange={handleChange}
                className={inputCls} style={inputStyle}>
                <option value="">None / General</option>
                {specializations.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}

          {/* Read-only academic fields */}
          <div>
            <p className="text-xs font-semibold mb-3" style={{ color: '#94a3b8' }}>
              Academic Details <span className="font-normal">(managed by admin)</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ReadOnlyField label="Department"        value={profile?.department} />
              <ReadOnlyField label="Year of Study"     value={profile?.yearOfStudy ? `Year ${profile.yearOfStudy}` : null} />
              <ReadOnlyField label="Scheme"            value={profile?.scheme} />
              <ReadOnlyField label="Course Start Year" value={profile?.courseStartYear} />
              <ReadOnlyField label="Course End Year"   value={profile?.courseEndYear} />
              <ReadOnlyField label="Class Batch"       value={profile?.classBatchDisplayName || profile?.classBatchName} />
              <ReadOnlyField label="Semester"           value={profile?.semester != null ? `Semester ${profile.semester}` : null} />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button"
              onClick={() => { setEditing(false); setForm(toForm(profile)); setError(null); }}
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
