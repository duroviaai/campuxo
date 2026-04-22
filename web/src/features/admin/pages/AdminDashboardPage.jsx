import { useState } from 'react';
import useAdminStats from '../hooks/useAdminStats';
import usePendingUsers from '../hooks/usePendingUsers';
import StatsCards from '../../dashboard/components/StatsCards';
import PendingUsersTable from '../components/PendingUsersTable';
import Loader from '../../../shared/components/feedback/Loader';
import Error from '../../../shared/components/feedback/Error';

const TABS = [
  { label: 'All',      role: null },
  { label: 'Students', role: 'ROLE_STUDENT' },
  { label: 'Faculty',  role: 'ROLE_FACULTY' },
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      {!statsLoading && stats && <StatsCards stats={stats} />}

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-800">Pending Approvals</h2>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {TABS.map((tab, i) => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(i)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === i
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <PendingTab role={TABS[activeTab].role} />
      </div>
    </div>
  );
};

export default AdminDashboardPage;
