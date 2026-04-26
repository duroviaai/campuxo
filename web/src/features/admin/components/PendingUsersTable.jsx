import { memo } from 'react';
import UserRow from './UserRow';

const PENDING_COLS  = ['Name / ID', 'Email', 'Role', 'Registered', 'Actions'];
const APPROVED_COLS = ['Name / ID', 'Email', 'Role', 'Registered', 'Actions'];

const PendingUsersTable = memo(({ users, onApprove, onReject, onRevoke, mode = 'pending' }) => {
  const cols = mode === 'approved' ? APPROVED_COLS : PENDING_COLS;

  if (!users.length) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">
        {mode === 'pending' ? 'No pending approvals' : 'No approved users yet'}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-100">
      <table className="w-full text-sm text-left">
        <thead className="sticky top-0 bg-gray-50 z-10">
          <tr>
            {cols.map((col) => (
              <th key={col} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((user, i) => (
            <UserRow key={user.id} user={user} onApprove={onApprove} onReject={onReject} onRevoke={onRevoke} zebra={i % 2 === 1} mode={mode} />
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default PendingUsersTable;
