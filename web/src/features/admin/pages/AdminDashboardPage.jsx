import { useState } from 'react';
import useAdminStats from '../hooks/useAdminStats';
import usePendingUsers from '../hooks/usePendingUsers';
import PendingUsersTable from '../components/PendingUsersTable';
import Loader from '../../../shared/components/feedback/Loader';
import Error from '../../../shared/components/feedback/Error';
import { useGetStudentsByDepartmentQuery } from '../state/adminApi';

const TABS = [
  { label: 'All',      role: null },
  { label: 'Students', role: 'ROLE_STUDENT' },
  { label: 'Faculty',  role: 'ROLE_FACULTY' },
];

const STATS = [
  { key: 'students', label: 'Students' },
  { key: 'faculty',  label: 'Faculty'  },
  { key: 'courses',  label: 'Programs'  },
  { key: 'pending',  label: 'Pending'  },
];

const PendingTab = ({ role }) => {
  const { users, loading, error, approveUser, rejectUser } = usePendingUsers(role);
  if (loading) return <Loader />;
  if (error)   return <Error message={error?.message ?? 'Failed to load pending users.'} />;
  return <PendingUsersTable users={users} onApprove={approveUser} onReject={rejectUser} mode="pending" />;
};

const AdminDashboardPage = () => {
  const { stats, loading: statsLoading } = useAdminStats();
  const [activeTab, setActiveTab] = useState(0);
  const { data: studentsByDept = {}, isLoading: deptLoading } = useGetStudentsByDepartmentQuery();

  const deptEntries = Object.entries(studentsByDept).sort((a, b) => b[1] - a[1]);
  const maxCount = deptEntries.length ? deptEntries[0][1] : 1;

  return (
    <div className="space-y-6">

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS.map(({ key, label }) => (
          <div key={key} className="bg-white border border-gray-200 rounded-xl px-5 py-4">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            {statsLoading
              ? <div className="h-7 w-12 bg-gray-100 rounded animate-pulse" />
              : <p className="text-2xl font-bold text-gray-900">{stats?.[key] ?? '—'}</p>
            }
          </div>
        ))}
      </div>

      {/* Students by Department */}
      {deptEntries.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">Students by Department</h2>
          </div>
          <div className="p-4 space-y-3">
            {deptLoading ? (
              <div className="space-y-2">
                {[1,2,3].map(i => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}
              </div>
            ) : (
              deptEntries.map(([dept, count]) => (
                <div key={dept} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{dept}</span>
                      <span className="text-sm font-bold text-gray-900">{count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-violet-500 h-2 rounded-full transition-all"
                        style={{ width: `${(count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Pending Approvals */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Pending Approvals</h2>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {TABS.map((tab, i) => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(i)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeTab === i ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4">
          <PendingTab role={TABS[activeTab].role} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
