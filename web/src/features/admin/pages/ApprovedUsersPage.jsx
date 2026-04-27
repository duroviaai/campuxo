import { useState } from 'react';
import useApprovedUsers from '../hooks/useApprovedUsers';
import PendingUsersTable from '../components/PendingUsersTable';
import Loader from '../../../shared/components/feedback/Loader';
import Error from '../../../shared/components/feedback/Error';

const TABS = [
  { label: 'All',      role: null },
  { label: 'Students', role: 'ROLE_STUDENT' },
  { label: 'Faculty',  role: 'ROLE_FACULTY' },
];

const ApprovedTab = ({ role }) => {
  const { users, loading, error, revokeUser } = useApprovedUsers(role);
  if (loading) return <Loader />;
  if (error)   return <Error message={error?.message ?? 'Failed to load approved users.'} />;
  return <PendingUsersTable users={users} onRevoke={revokeUser} mode="approved" />;
};

const ApprovedUsersPage = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-800">Active Members</h2>
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
        <ApprovedTab role={TABS[activeTab].role} />
      </div>
    </div>
  );
};

export default ApprovedUsersPage;
