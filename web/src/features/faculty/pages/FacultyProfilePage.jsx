import { useEffect, useState } from 'react';
import { getMyProfile, getFacultyAssignments } from '../services/facultyService';

const Field = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
    <p className="text-sm font-semibold text-gray-800">{value || '—'}</p>
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

  if (loading) return <p className="text-sm text-gray-500">Loading...</p>;
  if (error)   return <p className="text-sm text-red-500">{error}</p>;

  const uniqueCourses = [...new Map(assignments.map((a) => [a.courseId, a])).values()];

  return (
    <div className="space-y-5 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      {/* Identity card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-600">
            {profile.fullName?.charAt(0) ?? '?'}
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{profile.fullName}</p>
            <span className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full font-semibold">
              Faculty
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5 pt-2 border-t border-gray-100">
          <Field label="Email"      value={profile.email} />
          <Field label="Faculty ID" value={profile.facultyId} />
          <Field label="Department" value={profile.department} />
          <Field label="Courses Assigned" value={uniqueCourses.length} />
        </div>
      </div>

      {/* Assigned courses */}
      {uniqueCourses.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Assigned Courses</h2>
          <div className="space-y-2">
            {uniqueCourses.map((a) => (
              <div key={a.courseId} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">{a.courseName}</p>
                  <p className="text-xs text-gray-400 font-mono">{a.courseCode}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {assignments.filter((x) => x.courseId === a.courseId).map((x) => x.classDisplayName).join(', ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyProfilePage;
