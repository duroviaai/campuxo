import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const stats = [
  { label: 'Total Students', value: 320, icon: '🎓', color: 'bg-indigo-50 text-indigo-600' },
  { label: 'Total Faculty',  value: 28,  icon: '👨‍🏫', color: 'bg-emerald-50 text-emerald-600' },
  { label: 'Total Courses',  value: 12,  icon: '📚', color: 'bg-amber-50 text-amber-600' },
  { label: 'Attendance Today', value: '87%', icon: '✅', color: 'bg-sky-50 text-sky-600' },
];

const studentsPerCourse = [
  { course: 'Math',      students: 45 },
  { course: 'Physics',   students: 38 },
  { course: 'CS',        students: 60 },
  { course: 'Chemistry', students: 30 },
  { course: 'English',   students: 52 },
];

const attendanceData = [
  { name: 'Present', value: 210 },
  { name: 'Absent',  value: 70  },
  { name: 'Late',    value: 40  },
];

const PIE_COLORS = ['#22c55e', '#ef4444', '#f59e0b'];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon, color }) => (
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

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-700 mb-4">Students per Course</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={studentsPerCourse} barSize={36}>
              <XAxis dataKey="course" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f3f4f6' }} />
              <Bar dataKey="students" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-700 mb-4">Attendance Distribution</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={attendanceData}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={50}
                paddingAngle={3}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {attendanceData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Legend iconType="circle" iconSize={10} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
