import { useEffect, useState } from 'react';
import { getMyProfile, getFacultyAssignments } from '../services/facultyService';
import { Card } from '../../../shared/components/ui/PageShell';

const Field = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#94a3b8' }}>{label}</p>
    <p className="text-sm font-medium" style={{ color: value ? '#0f172a' : '#cbd5e1' }}>{value || '—'}</p>
  </div>
);

const FacultyProfilePage = () => {
  const [profile, setProfile]         = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  useEffect(() => {
    Promise.all([getMyProfile(), getFacultyAssignments()])
      .then(([p, a]) => { setProfile(p); setAssignments(a ?? []); })
      .catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-3">{[1,2].map(i => <div key={i} className="rounded-xl h-32 skeleton" />)}</div>;
  if (error)   return <p className="text-sm" style={{ color: '#dc2626' }}>{error}</p>;

  const uniqueCourses = [...new Map(assignments.map(a => [a.courseId, a])).values()];

  return (
    <div className="space-y-4 max-w-2xl">
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white shrink-0" style={{ background: '#7c3aed' }}>
              {profile.fullName?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
            <div>
              <p className="text-base font-bold" style={{ color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{profile.fullName}</p>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md" style={{ background: '#f5f3ff', color: '#7c3aed' }}>Faculty</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5 pt-5" style={{ borderTop: '1px solid #f1f5f9' }}>
            <Field label="Email"            value={profile.email} />
            <Field label="Faculty ID"       value={profile.facultyId} />
            <Field label="Department"       value={profile.department} />
            <Field label="Courses Assigned" value={uniqueCourses.length || null} />
          </div>
        </div>
      </Card>

      {uniqueCourses.length > 0 && (
        <Card>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>Assigned Courses</p>
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

export default FacultyProfilePage;
