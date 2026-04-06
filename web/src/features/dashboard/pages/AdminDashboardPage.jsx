import useAdminStats from '../../admin/hooks/useAdminStats';
import usePendingUsers from '../../admin/hooks/usePendingUsers';
import StatsCards from '../components/StatsCards';
import PendingUsersTable from '../../admin/components/PendingUsersTable';
import Loader from '../../../shared/components/feedback/Loader';
import Error from '../../../shared/components/feedback/Error';

const AdminDashboardPage = () => {
  const { stats, loading: statsLoading } = useAdminStats();
  const { users, loading, error, approveUser, rejectUser } = usePendingUsers();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      {!statsLoading && stats && <StatsCards stats={stats} />}

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">
          Pending Approvals
          {!loading && (
            <span className="ml-2 text-xs font-normal text-gray-400">({users.length})</span>
          )}
        </h2>
        {loading ? (
          <Loader />
        ) : error ? (
          <Error message={error?.message ?? 'Failed to load pending users.'} />
        ) : (
          <PendingUsersTable users={users} onApprove={approveUser} onReject={rejectUser} />
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
