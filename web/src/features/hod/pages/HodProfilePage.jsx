import { useState } from 'react';
import toast from 'react-hot-toast';
import { useGetHodMeQuery, useGetHodFacultyAssignmentsQuery, useUpdateHodProfileMutation } from '../state/hodApi';
import { Card } from '../../../shared/components/ui/PageShell';

const Field = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#94a3b8' }}>{label}</p>
    <p className="text-sm font-medium" style={{ color: value ? '#0f172a' : '#cbd5e1' }}>{value || '—'}</p>
  </div>
);

const inputCls = 'w-full px-3.5 py-2.5 text-sm rounded-lg outline-none transition-all';
const inputStyle = { border: '1.5px solid #e2e8f0', background: '#fff', color: '#0f172a' };
const focusHandlers = {
  onFocus: e => { e.target.style.borderColor = '#7c3aed'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'; },
  onBlur:  e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = ''; },
};

const FIELDS = [
  { name: 'phone',         label: 'Phone',              type: 'text' },
  { name: 'designation',   label: 'Designation',        type: 'text' },
  { name: 'qualification', label: 'Qualification',      type: 'text' },
  { name: 'experience',    label: 'Experience (years)', type: 'number' },
  { name: 'subjects',      label: 'Subjects',           type: 'text' },
  { name: 'joiningDate',   label: 'Joining Date',       type: 'date' },
];

const toForm = (p) => ({
  phone:         p?.phone         ?? '',
  designation:   p?.designation   ?? '',
  qualification: p?.qualification ?? '',
  experience:    p?.experience    ?? '',
  subjects:      p?.subjects      ?? '',
  joiningDate:   p?.joiningDate   ?? '',
});

const HodProfilePage = () => {
  const { data: me, isLoading: meLoading } = useGetHodMeQuery();
  const { data: assignments = [], isLoading: assignmentsLoading } = useGetHodFacultyAssignmentsQuery(
    me?.id, { skip: !me?.id }
  );
  const [updateProfile, { isLoading: saving }] = useUpdateHodProfileMutation();

  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({});

  const loading = meLoading || assignmentsLoading;

  const handleEdit   = () => { setForm(toForm(me)); setEditing(true); };
  const handleCancel = () => setEditing(false);
  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        ...form,
        experience: form.experience !== '' ? Number(form.experience) : null,
        joiningDate: form.joiningDate || null,
      }).unwrap();
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  if (loading) return <div className="space-y-3">{[1, 2].map(i => <div key={i} className="rounded-xl h-32 skeleton" />)}</div>;

  const uniqueCourses = [...new Map(assignments.map(a => [a.courseId, a])).values()];

  return (
    <div className="space-y-4 max-w-2xl">
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white shrink-0" style={{ background: '#7c3aed' }}>
                {me?.fullName?.charAt(0)?.toUpperCase() ?? '?'}
              </div>
              <div>
                <p className="text-base font-bold" style={{ color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{me?.fullName}</p>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md" style={{ background: '#f5f3ff', color: '#7c3aed' }}>HOD</span>
              </div>
            </div>
            {!editing && (
              <button onClick={handleEdit}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-white"
                style={{ background: '#7c3aed' }}>
                Edit Profile
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-5 pt-5" style={{ borderTop: '1px solid #f1f5f9' }}>
            <Field label="Email"            value={me?.email} />
            <Field label="Faculty ID"       value={me?.facultyId} />
            <Field label="Department"       value={me?.department} />
            <Field label="Courses Assigned" value={uniqueCourses.length || null} />
          </div>
        </div>
      </Card>

      {!editing ? (
        <Card>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Phone"         value={me?.phone} />
            <Field label="Designation"   value={me?.designation} />
            <Field label="Qualification" value={me?.qualification} />
            <Field label="Experience"    value={me?.experience != null ? `${me.experience} yr${me.experience !== 1 ? 's' : ''}` : null} />
            <Field label="Subjects"      value={me?.subjects} />
            <Field label="Joining Date"  value={me?.joiningDate} />
          </div>
        </Card>
      ) : (
        <form onSubmit={handleSave} className="bg-white rounded-xl p-6 space-y-4" style={{ border: '1px solid #e8edf2' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FIELDS.map(({ name, label, type }) => (
              <div key={name} className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold" style={{ color: '#64748b' }}>{label}</label>
                <input
                  type={type}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  className={inputCls}
                  style={inputStyle}
                  {...focusHandlers}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={handleCancel}
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

      {uniqueCourses.length > 0 && (
        <Card>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>Assigned Programs</p>
          </div>
          <div className="p-4 space-y-2">
            {uniqueCourses.map((a) => (
              <div key={a.courseId} className="flex items-center justify-between px-3 py-2.5 rounded-lg" style={{ border: '1px solid #f1f5f9' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{ background: '#7c3aed' }}>
                    {a.courseCode?.slice(0, 2) ?? '??'}
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: '#0f172a' }}>{a.courseName}</p>
                    <p className="text-[10px] font-mono" style={{ color: '#94a3b8' }}>{a.courseCode}</p>
                  </div>
                </div>
                <p className="text-xs" style={{ color: '#64748b' }}>
                  {assignments.filter(x => x.courseId === a.courseId).map(x => x.classDisplayName).join(', ')}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default HodProfilePage;
