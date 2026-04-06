import useAuth from '../../auth/hooks/useAuth';

const StudentDashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Welcome, {user?.username}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Enrolled Courses', value: 5,    icon: '📚', color: 'bg-indigo-50 text-indigo-600' },
          { label: 'Attendance',       value: '88%', icon: '✅', color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Upcoming Exams',   value: 2,    icon: '📝', color: 'bg-amber-50 text-amber-600' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`text-2xl w-12 h-12 flex items-center justify-center rounded-lg ${color}`}>
              {icon}
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{label}</p>
              <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentDashboardPage;
